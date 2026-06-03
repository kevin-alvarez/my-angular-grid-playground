import express, { json } from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors())

const products = [
  {
    sku: 'POL-ROJ-001',
    name: 'Polera Roja',
    description: 'Polera Roja',
    style: {
      code: 'COL-ROJ',
      value: 'ROJO',
    },
  },
  {
    sku: 'POL-ROJ-002',
    name: 'Polera Roja 2.0',
    description: 'Segunda edicion de Polera Roja',
    style: {
      code: 'COL-ROJ',
      value: 'ROJO',
    },
  },
  {
    sku: 'POL-AZU-001',
    name: 'Polera Azul',
    description: 'Polera Azul',
    style: {
      code: 'COL-AZU',
      value: 'AZUL',
    },
  },
  {
    sku: 'POL-VER-001',
    name: 'Polera Verde',
    description: 'Polera Verde',
    style: {
      code: 'COL-VER',
      value: 'VERDE',
    },
  },
];

app.get('/products', (request, response) => {
  console.log('Request: ', request.url);
  const skus = request.query.sku;
  const filteredProducts = products.filter(
    (p) => skus.includes(p.sku)
  );
  return response.json(filteredProducts);
});

app.listen(4040, () => {
  console.log('Express server running in port 4040');
})

