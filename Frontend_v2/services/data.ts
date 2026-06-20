

const host = "172.20.137.129"

export async function get_user_profiles(options){
  const BASE_URL = 'http://' + host + ':3002/api/profiles/filter';
  
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
    
    return data;

  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}



export async function getUserProfilesCount(options){
  const BASE_URL = 'http://' + host + ':3002/api/profiles/count';
  
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



export const ACCOUNTS_DATA = async (entity_id: any) => {
  const BASE_URL = 'http://' + host + ':3002/api/account?entity_id=';
  let response = await fetch(BASE_URL + entity_id)
  const account_info = await response.json()
  return account_info

}

export const PERSONAL_DATA = async (entity_id: any) => {
  const BASE_URL = 'http://' + host + ':3002/api/entity?entity_id=';
  let response = await fetch(BASE_URL + entity_id)
  const person_info = await response.json()
  return person_info
}




export const get_dashboard_data = async() => {
  const BASE_URL = 'http://' + host + ':3002/api/etl/summary';
  let response = await fetch(BASE_URL)
  const data = await response.json()
  return data
}



