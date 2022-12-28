const express = require('express');
const app = express();
const notion = require('./services/notion');

// 082b5dc863a746559f867ff5ffe53b9c

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the static files directory
app.use(express.static(__dirname + '/public'));

// Set the routes
app.get('/invoice', async function(req, res) {
  // Get notion id and parse
  const pageId = req.query.pageId;
  const data = await notion.getData(pageId);

  res.render('invoice', {
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    items: data.items,
    invoiceSum: data.invoiceSum,
    doctor: data.doctor,
    nurse: data.nurse
  });
});

// Start the server
app.listen(3000, function() {
  console.log('Listening on port 3000');
});