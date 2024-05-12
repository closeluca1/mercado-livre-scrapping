const axios = require('axios');
const cheerio = require('cheerio');
const readlineSync = require('readline-sync');
const fs = require('fs');

const urlBase = 'https://lista.mercadolivre.com.br/';

const prod_search = readlineSync.question('Qual produto você deseja? ');

const fetchData = async () => {
  try {
    const response = await axios.get(urlBase + prod_search);
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    return null;
  }
};

const parseData = (html) => {
  const $ = cheerio.load(html);
  const testeget = [];

  const titleSelector = '.ui-search-item__title';
  const linkSelector = '.ui-search-item__group__element.ui-search-link';
  const priceSelector = '.andes-money-amount.ui-pdp-price__part[aria-label] meta';

  $('.ui-search-result__content').each((index, element) => {
    try {
      const title = $(element).find(titleSelector).text().trim();
      const link = $(element).find(linkSelector).attr('href');
      const priceAriaLabel = $(element).find(priceSelector).prop('content');

      let price = '';
      if (priceAriaLabel) {
        const priceMatch = priceAriaLabel.match(/(\d+\.\d+)/);
        price = priceMatch ? priceMatch[0] : '';
      }

      testeget.push({ title, link, price: `R$ ${price}` });
    } catch (error) {
      console.error('Erro ao analisar o produto:', error);
    }
  });

  return testeget;
};

const scrapeData = async () => {
  const html = await fetchData();
  if (html) {
    return parseData(html);
  }
  return null;
};

const saveToCSV = (data) => {
  const csvContent = data.map(item => Object.values(item).join(',')).join('\n');

  fs.writeFile('tabela.csv', csvContent, (err) => {
    if (err) {
      console.error('Erro ao salvar arquivo CSV:', err);
    } else {
      console.log('Dados salvos em tabela.csv');
    }
  });
};

(async () => {
  try {
    const scrapedData = await scrapeData();
    if (scrapedData && scrapedData.length > 0) {
      console.log(scrapedData);
      saveToCSV(scrapedData);
    } else {
      console.log('Nenhum dado foi obtido.');
    }
  } catch (error) {
    console.error('Erro ao fazer o scraping:', error.message);
  }
})();
