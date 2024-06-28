const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();
const PORT = 3000;
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/front/authentication', express.static(path.join(__dirname, 'front/auth')));
app.use('/front/styles', express.static(path.join(__dirname, 'front/styles')));
app.use('/front/src', express.static(path.join(__dirname, 'front/src')));
app.use('/front/desktop', express.static(path.join(__dirname, 'front/desktop')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/auth/auth.html'));
});

app.get('/desktop', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/desktop/desktop.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

