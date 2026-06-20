function safeParse(invalidJsonString) {
  if (typeof invalidJsonString !== 'string') {
    console.error("Input must be a string.");
    return null;
  }

  let correctedString = invalidJsonString
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null');

  correctedString = correctedString.replace(/'/g, '"');

  try {
    const parsedObject = JSON.parse(correctedString);
    return parsedObject;
  } catch (error) {
    console.error("Failed to parse corrected JSON string:", error.message);
    return null;
  }
}

function getRandomLengthSample(arr) {
  if (arr.length === 0) {
    return [];
  }

  const randomLength = Math.floor(Math.random()) + 1;
  let shuffledArray = [...arr];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  const sample = shuffledArray.slice(0, randomLength);
  return sample;
}

const risk_types = ["Zombie Account Activation ",
              "Smurfing ",
              "Early Maturity ",
              "Peer Deviation ",
              "Structuring ",
              "Layering ",
              "Fraud ",
              "Unusual Behavior ",
              "Round Number Hoarding ",
              "Bentford Law Violation "]

const host = "172.20.137.129" //"172.20.137.129"; //"localhost"; //172.20.137.129


export async function get_transactions(){
    const query = "http://" + host + ":3002/api/transaction_risk_profiles";
    const response = await fetch(query)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = response.json()
    .then((data) => {
        const new_data = []

        for (const row of data){
	  
            const new_row = {
                ...row,
                //from_account : "Test Data",
                //from_name : "Test Data",
                //to_account : "Test Data",
                //to_name : "Test Data",
                //amount : 0,
                //transaction_type : "Test Data",
                //transaction_time : "Test Data"
            }

            //new_row.overall_risk_score = (new_row.frequency_24hr * new_row.amount) < 1000000 ? 40 : (new_row.frequency_24hr * new_row.amount) < 2000000 ? 60 : (new_row.frequency_24hr * new_row.amount) < 3000000 ? 80 : (new_row.frequency_24hr * new_row.amount) < 4000000 ? 90 : 100
            //new_row.risk_level = new_row.overall_risk_score < 50 ? "LOW" : new_row.overall_risk_score < 80 ? "MEDIUM" : "HIGH";
		
            
	    //= new_row.overall_risk_score < 60 ? [] : getRandomLengthSample(risk_types)
            
            new_data.push(new_row)
           
        }
        return (new_data)
    })

    //console.log('Fetched Data:', data);
    
    return data;
}


export async function get_customers(){
    const query = "http://" + host + ":3002/api/customer_risk_profiles"
    const response = await fetch(query)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    //const data = await response.json();

    const data = response.json()
    .then((data) => {
        const new_data = []

        for (const row of data){
            const new_row = {
                ...row,
                //account_age: 100,
                //occupation: "Test Occupation",
                //region: "Test Region"
            }

            new_row.DEMOGRAPHICS_RISK = safeParse(new_row.DEMOGRAPHICS_RISK)
            new_row.KYC_INTEGRITY_UNIQUENESS = safeParse(new_row.KYC_INTEGRITY_UNIQUENESS)
            new_row.PEER_PROFILE_ACCOUNT_AGE = safeParse(new_row.PEER_PROFILE_ACCOUNT_AGE)
            new_row.PEER_PROFILE_OCCUPATION = safeParse(new_row.PEER_PROFILE_OCCUPATION)
            new_row.PEER_PROFILE_REGION = safeParse(new_row.PEER_PROFILE_REGION)
            new_row.PEP_HITS = safeParse(new_row.PEP_HITS)
            new_row.SANCTION_HITS = safeParse(new_row.SANCTION_HITS)
            new_row.WATCHLIST_HITS = safeParse(new_row.WATCHLIST_HITS)
            new_row.REASON_CODES_JSON = safeParse(new_row.REASON_CODES_JSON)
            new_row.TIME_SERIES_GAP = safeParse(new_row.TIME_SERIES_GAP)
            //new_row.RISK_SCORE = (10 * new_row.KYC_INTEGRITY_UNIQUENESS.idcard_matches) > 100 ? 100 : (10 * new_row.KYC_INTEGRITY_UNIQUENESS.idcard_matches)
            //new_row.RISK_LEVEL = new_row.RISK_SCORE < 30 ? "LOW" : new_row.RISK_SCORE < 60 ? "MEDIUM" : "HIGH";

            new_data.push(new_row)
           
        }
        return (new_data)
    })

    //console.log('Fetched Data:', data);
    return data;
}

/*
  {
    limit: itemsPerPage,
    offset: offset,
    search: filterText,
  }
*/

 
export async function fetchTransactions(options) {
  const BASE_URL = 'http://' + host + ':3002/api/transaction_risk_profiles/filter';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
        const new_data = []

        for (const row of data){
            const new_row = {
                ...row,
                //from_account : "Test Data",
                //from_name : "Test Data",
                //to_account : "Test Data",
                //to_name : "Test Data",
                //amount : 0,
                //transaction_type : "Test Data",
                //transaction_time : "Test Data"
            }

            //new_row.overall_risk_score = (new_row.frequency_24hr * new_row.amount) < 1000000 ? 40 : (new_row.frequency_24hr * new_row.amount) < 2000000 ? 60 : (new_row.frequency_24hr * new_row.amount) < 3000000 ? 80 : (new_row.frequency_24hr * new_row.amount) < 4000000 ? 90 : 100
            new_row.risk_level = new_row.overall_risk_score < 50 ? "LOW" : new_row.overall_risk_score < 70 ? "MEDIUM" :  new_row.overall_risk_score < 85 ? "HIGH" : "CRITICAL";
            new_row.reason_codes = new_row.overall_risk_score < 60 ? [] : new_row.reason_codes; //getRandomLengthSample(risk_types);
	    //new_row.reason_codes = [];
            
            new_data.push(new_row)
           
        }
        return (new_data)
    })

    return data;

  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}


export async function fetchCustomers(options) {
  const BASE_URL = 'http://' + host + ':3002/api/customer_risk_profiles/filter';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
        const new_data = []

        for (const row of data){
            const new_row = {
                ...row,
                //account_age: 100,
                //occupation: "Test Occupation",
                //region: "Test Region"
            }

            new_row.DEMOGRAPHICS_RISK = safeParse(new_row.DEMOGRAPHICS_RISK)
            new_row.KYC_INTEGRITY_UNIQUENESS = safeParse(new_row.KYC_INTEGRITY_UNIQUENESS)
            new_row.PEER_PROFILE_ACCOUNT_AGE = safeParse(new_row.PEER_PROFILE_ACCOUNT_AGE)
            new_row.PEER_PROFILE_OCCUPATION = safeParse(new_row.PEER_PROFILE_OCCUPATION)
            new_row.PEER_PROFILE_REGION = safeParse(new_row.PEER_PROFILE_REGION)
            new_row.PEP_HITS = safeParse(new_row.PEP_HITS)
            new_row.SANCTION_HITS = safeParse(new_row.SANCTION_HITS)
            new_row.WATCHLIST_HITS = safeParse(new_row.WATCHLIST_HITS)
            new_row.REASON_CODES_JSON = safeParse(new_row.REASON_CODES_JSON)
            new_row.TIME_SERIES_GAP = safeParse(new_row.TIME_SERIES_GAP)
            new_row.RISK_SCORE = (10 * new_row.KYC_INTEGRITY_UNIQUENESS.idcard_matches) > 100 ? 100 : (10 * new_row.KYC_INTEGRITY_UNIQUENESS.idcard_matches)
            new_row.RISK_LEVEL = new_row.RISK_SCORE < 30 ? "LOW" : new_row.RISK_SCORE < 60 ? "MEDIUM" : "HIGH";

            new_data.push(new_row)
           
        }
        return (new_data)
    })
    
    return data;

  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}


export async function fetchTransactionCount(options){
  
  const BASE_URL = 'http://' + host + ':3002/api/transaction_risk_profiles/count';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
      return data[0]["count"]
    })
    .then(data => {
      return Number(data)
    })

    return data;
  
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

}

export async function fetchCustomerCount(options){
  const BASE_URL = 'http://' + host + ':3002/api/customer_risk_profiles/count';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
      return data[0]["count"]
    })
    .then(data => {
      return Number(data)
    })

    return data;
  
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

}








export async function fetchCustomerProfile(options) {
  const BASE_URL = 'http://' + host + ':3002/api/customer_profile/filter';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
        const new_data = []

        for (const row of data){
            const new_row = {
                ...row,
                //account_age: 100,
                //occupation: "Test Occupation",
                //region: "Test Region"
            }

        

            new_data.push(new_row)
           
        }
        return (new_data)
    })
    
    return data;

  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

export async function fetchCustomerProfileCount(options){
  const BASE_URL = 'http://' + host + ':3002/api/customer_profile/count';
  
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const url = `${BASE_URL}?${params.toString()}`;

  //console.log(`Sending GET request to: ${url}`); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    .then((data) => {
      return data[0]["count"]
    })
    .then(data => {
      return Number(data)
    })

    return data;
  
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

}




