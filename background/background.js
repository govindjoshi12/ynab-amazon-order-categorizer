async function getPlans() {
  const endpoint = `${YNAB_BASE_URL}/plans`
  const token = await localGet(ACCESS_TOKEN_KEY)
  const token_type = await localGet(TOKEN_TYPE_KEY)
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${token_type} ${token}` 
    },
  });

  const result = await response.json();
  console.log(result)
}