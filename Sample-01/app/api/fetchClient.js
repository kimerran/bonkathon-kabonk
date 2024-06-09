module.exports.apiPost = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload) // body data type must match "Content-Type" header
  });

  return response.json();
};

module.exports.apiGet = async url => {
  const response = await fetch(url);
  return response.json();
};
