require('dotenv').config();

const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors');

const app = express();
const port = 3002;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const user_table_name = process.env.USER_PROFILE_TABLE_NAME || "users_profile_v2";
const entity_table_name = process.env.ENTITY_TABLE_NAME || "person_entity_table";
const accounts_table_name = process.env.ACCOUNTS_TABLE_NAME || "account_entity_table";
const all_transactions_table_name = process.env.ALL_TRANSACTIONS_TABLE_NAME || "transactions"
const cleaned_transactions_table_name = process.env.CLEANED_TRANSACTIONS_TABLE_NAME || "cleaned_transactions"

app.use(cors());
app.use(express.json()); 




// 1. Endpoint to retrun latest 10 risk profiles for testing
app.get('/api/profiles/test', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${user_table_name} ORDER BY "unique_accounts_held" DESC OFFSET 2050 LIMIT 1000`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});







// 2. Function to build a sql query to  fetch customer risk profiles
function buildQuery(options, table_name=user_table_name, count=false) {
  
  const { limit, offset, search, sortField } = options;
  let whereClause = '';
  const values = [];
  let parameterIndex = 1; 

  if ((search && search.trim().length > 0) ) {
    
    whereClause = `
      WHERE 
        (
          "index" ILIKE $${parameterIndex}
        )
    `;
    
    values.push(`%${search.trim()}%`);
    parameterIndex++;
  }

  let query = `
    SELECT 
      ${count? "count(*)":"*"} FROM 
      "${table_name}"
    ${whereClause}
    ${
      count ? "" : 
      sortField ? 
        `ORDER BY ` +  (`"${sortField}" DESC`)
             : ""
    } 
     
  `;

  const limitValue = limit ? parseInt(limit, 10) : undefined;
  const offsetValue = offset ? parseInt(offset, 10) : undefined;
  
  if (limitValue !== undefined && !isNaN(limitValue)) {
    query += ` LIMIT $${parameterIndex}`;
    values.push(limitValue);
    parameterIndex++;
  } else {
    
  }

  if (offsetValue !== undefined && !isNaN(offsetValue)) {
    query += ` OFFSET $${parameterIndex}`;
    values.push(offsetValue);
    parameterIndex++;
  }

  return {
    query: query.trim(),
    values,
  };
}






//3. Endpoint to fetch customer risk profiles with or without options for pagination, search and sorting
app.get('/api/profiles/filter', async (req, res) => {
  try {
    const options = req.query;

    const { query, values } = buildQuery(options, user_table_name);
  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});







//4. Endpoint to fetch count of customer risk profiles with or without options for pagination, search and sorting
app.get('/api/profiles/count', async (req, res) => {

  try {
    const options = req.query;

    const { query, values } = buildQuery(options, user_table_name, count=true);
  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});




// 5. Endpoint to retrun Entities
app.get('/api/entity', async (req, res) => {
  try {
    const entity_id = req.query.entity_id
    const result = await pool.query(`SELECT * FROM ${entity_table_name} WHERE personid = '${entity_id}'`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


// 6. Endpoint to retrun Entities
app.get('/api/account', async (req, res) => {
  try {
    const entity_id = req.query.entity_id
    const result = await pool.query(`SELECT * FROM ${accounts_table_name} WHERE ownerentity = '${entity_id}'`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});




// 7. Return dashboard info

app.get('/api/etl/summary', async (req, res) => {
  try {
    const data = {}

    const result1 = await pool.query(`SELECT count(*) FROM ${all_transactions_table_name}`)
    data['transactions_recieved'] = result1.rows[0]["count"]

    const result2 = await pool.query(`SELECT count(*) FROM ${cleaned_transactions_table_name}`)
    data['transactions_cleaned'] = result2.rows[0]["count"]

    const result3 = await pool.query(`SELECT count(*) FROM ${accounts_table_name}`)
    data['accounts_encountered'] = result3.rows[0]["count"]

    const result4 = await pool.query(`SELECT count(*) FROM ${user_table_name}`)
    data['entities_identified'] = result4.rows[0]["count"]

    const result5 = await pool.query(`select sum("total_amount_received") as "total_received", sum("total_amount_sent") as "total_sent" from ${user_table_name}`)
    const joined_data = {...data, ...result5.rows[0]}

    res.json(joined_data)

  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
})

























app.get('/api/transaction_risk_profiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transaction_risk_profiles ORDER BY "generated_at" DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/customer_risk_profiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_risk_profiles ORDER BY "CREATED_AT" DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});




function buildTransactionQuery(options, table_name, count=false) {
  
  const { limit, offset, search, risk_filter } = options;
  console.log("Options: ", options)
  let whereClause = '';
  const values = [];
  let parameterIndex = 1; 

  let filterText = "";

  const riskLevel = risk_filter ? (risk_filter === "LOW" ? [0, 50] 
                                    : (risk_filter === "MEDIUM" ? [50, 70] 
                                        : (risk_filter === "HIGH" ? [70, 85] 
                                            : (risk_filter === "CRITICAL" ? [85, 1000] 
                                                : undefined
                                              )
                                            )
                                          )
                                        ) 
                                  : undefined;
    console.log("RiskLevel: ", riskLevel, "Bool", riskLevel !== undefined)

    if (riskLevel !== undefined) {
      console.log("Entered....")
      filterText += `"overall_risk_score" >= $${parameterIndex} AND "overall_risk_score" <= $${parameterIndex + 1}`;
      values.push(riskLevel[0], riskLevel[1]);
      parameterIndex +=2 ;
    }

    console.log("FilterText: ", filterText)



  if ((search && search.trim().length > 0) || riskLevel) {
    
    whereClause = `
      WHERE 
        (
          ${riskLevel? filterText : "1"}
          OR
          "from_name" ILIKE $${parameterIndex} OR 
          "from_account" ILIKE $${parameterIndex}

        )
    `;
    
    values.push(`%${search.trim()}%`);
    parameterIndex++;
  }

  let query = `
    SELECT 
      ${count? "count(*)":"*"} FROM 
      "${table_name}"
    ${whereClause}
    ${
      count ? "" : 
      riskLevel ? `
      ORDER BY 
      "overall_risk_score" DESC,
      "generated_at" DESC
      `:
      `
      ORDER BY 
      "generated_at" DESC
      ` 
    } 
     
  `;

  const limitValue = limit ? parseInt(limit, 10) : undefined;
  const offsetValue = offset ? parseInt(offset, 10) : undefined;
  
  if (limitValue !== undefined && !isNaN(limitValue)) {
    query += ` LIMIT $${parameterIndex}`;
    values.push(limitValue);
    parameterIndex++;
  } else {
    
    //query += ` LIMIT 10`;
  }

  if (offsetValue !== undefined && !isNaN(offsetValue)) {
    query += ` OFFSET $${parameterIndex}`;
    values.push(offsetValue);
    parameterIndex++;
  }

  return {
    query: query.trim(),
    values,
  };
}


app.get('/api/transaction_risk_profiles/filter', async (req, res) => {
  const TABLE_NAME = "transaction_risk_profiles"
  try {
    const options = req.query;

    const { query, values } = buildTransactionQuery(options, TABLE_NAME);
    
    console.log('SQL Query:', query);
    console.log('SQL Values:', values);

    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


app.get('/api/transaction_risk_profiles/count', async (req, res) => {
  const TABLE_NAME = "transaction_risk_profiles"
  try {
    const options = req.query;

    const { query, values } = buildTransactionQuery(options, TABLE_NAME, count=true);
    
    //console.log('SQL Query:', query);
    //console.log('SQL Values:', values);

    const result = await pool.query(query, values);
    
    res.json(result.rows);

  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});



function buildCustomerQuery(options, table_name, count=false) {
  
  const { limit, offset, search} = options;
  let whereClause = '';
  const values = [];
  let parameterIndex = 1; 

  



  if ((search && search.trim().length > 0) ) {
    
    whereClause = `
      WHERE 
        (
          
          "Full_Name" ILIKE $${parameterIndex} OR 
          "Account_No" ILIKE $${parameterIndex}
        )
    `;
    
    values.push(`%${search.trim()}%`);
    parameterIndex++;
  }

  let query = `
    SELECT 
      ${count? "count(*)":"*"} FROM 
      "${table_name}"
    ${whereClause}
    ${
      count ? "" : 
        `
        ORDER BY 
        "CREATED_AT" DESC
        `
    } 
     
  `;

  const limitValue = limit ? parseInt(limit, 10) : undefined;
  const offsetValue = offset ? parseInt(offset, 10) : undefined;
  
  
  if (limitValue !== undefined && !isNaN(limitValue)) {
    query += ` LIMIT $${parameterIndex}`;
    values.push(limitValue);
    parameterIndex++;
  } else {
    
    //query += ` LIMIT 10`;
  }

  if (offsetValue !== undefined && !isNaN(offsetValue)) {
    query += ` OFFSET $${parameterIndex}`;
    values.push(offsetValue);
    parameterIndex++;
  }


  return {
    query: query.trim(),
    values,
  };
}




app.get('/api/customer_risk_profiles/filter', async (req, res) => {
  const TABLE_NAME = "customer_risk_profiles"
  try {
    const options = req.query;

    const { query, values } = buildCustomerQuery(options, TABLE_NAME);
    
    //console.log('SQL Query:', query);
    //console.log('SQL Values:', values);

  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


app.get('/api/customer_risk_profiles/count', async (req, res) => {
  const TABLE_NAME = "customer_risk_profiles"
  try {
    const options = req.query;

    const { query, values } = buildCustomerQuery(options, TABLE_NAME, count=true);
    
    //console.log('SQL Query:', query);
    //console.log('SQL Values:', values);

  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});












function buildCustomerProfileQuery(options, table_name, count=false) {
  
  const { limit, offset, search, sortField } = options;
  let whereClause = '';
  const values = [];
  let parameterIndex = 1; 

  if ((search && search.trim().length > 0) ) {
    
    whereClause = `
      WHERE 
        (
          "accountno" ILIKE $${parameterIndex}
        )
    `;
    
    values.push(`%${search.trim()}%`);
    parameterIndex++;
  }

  let query = `
    SELECT 
      ${count? "count(*)":"*"} FROM 
      "${table_name}"
    ${whereClause}
    ${
      count ? "" : 
        `ORDER BY ` +  (sortField ? 
            `"${sortField}" DESC`
            : `"accountno" ASC`)
    } 
     
  `;

  const limitValue = limit ? parseInt(limit, 10) : undefined;
  const offsetValue = offset ? parseInt(offset, 10) : undefined;
  
  
  if (limitValue !== undefined && !isNaN(limitValue)) {
    query += ` LIMIT $${parameterIndex}`;
    values.push(limitValue);
    parameterIndex++;
  } else {
    
    //query += ` LIMIT 10`;
  }

  if (offsetValue !== undefined && !isNaN(offsetValue)) {
    query += ` OFFSET $${parameterIndex}`;
    values.push(offsetValue);
    parameterIndex++;
  }


  return {
    query: query.trim(),
    values,
  };
}


app.get('/api/customer_profile/filter', async (req, res) => {
  const TABLE_NAME = "customer_profile"
  //console.log("Reached here....")
  try {
    const options = req.query;
    //console.log("Options: ", options)

    const { query, values } = buildCustomerProfileQuery(options, TABLE_NAME);
    
    //console.log('SQL Query:', query);
    //console.log('SQL Values:', values);

  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


app.get('/api/customer_profile/count', async (req, res) => {
  const TABLE_NAME = "customer_profile"
  try {
    const options = req.query;

    const { query, values } = buildCustomerProfileQuery(options, TABLE_NAME, count=true);
    
    //console.log('SQL Query:', query);
    //console.log('SQL Values:', values);
  
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});























app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
