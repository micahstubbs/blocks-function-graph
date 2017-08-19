const fs = require('fs');
const jf = require('jsonfile');
// const d3 = require('d3');
// const _ = require('lodash');

const inputFile = 'blocks-api.json';
const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

const outputData = {
  graph: {
    nodes: [],
    links: []
  }
};

// use blocks data as-is for nodes
outputData.nodes = data;

// group nodes by d3 function (API)
const functionsHash = {};
data.forEach(d => {
  Object.keys(d.api).forEach(key => {
    // if the key is not already in the functionsHash,
    // initialize it as an empty array
    if (typeof functionsHash[key] === 'undefined') {
      functionsHash[key] = [];
    }
    functionsHash[key].push(d);
  });
});

// build up links by iterating over the functions (APIs)
// listed for each block
const linksHash = {};
// loop over all functions
Object.keys(functionsHash).forEach(key => {
  const currentFunction = functionsHash[key];
  // for each function
  // loop over all blocks that use that function
  currentFunction.forEach(sourceBlock => {
    // loop over all blocks that use that function, again
    currentFunction.forEach(targetBlock => {
      // if we are not comparing a block to itself
      if (sourceBlock.id !== targetBlock.id) {
        // if the link does not already exist, create it
        if (
          typeof linksHash[`${sourceBlock.id}${targetBlock.id}`] === 'undefined'
        ) {
          linksHash[`${sourceBlock.id}${targetBlock.id}`] = {
            source: sourceBlock.id,
            target: targetBlock.id,
            weight: 0 // the number of shared functions
          }
        }
        // incremement the link's weight
        linksHash[`${sourceBlock.id}${targetBlock.id}`].weight += 1;
      }
    });
  });
});

// add each link in the linksHash to our graph object
Object.keys(linksHash).forEach(key => {
  outputData.graph.links.push(linksHash[key]);
})

// console.log('functions', Object.keys(functionsHash));

// Optionally write out functionsHash
//
// let outputFile = 'metrics/functionsHash.json';
// let outputJsonObj = functionsHash;
// jf.writeFile(outputFile, outputJsonObj, { spaces: 2 }, function(err) {
//   console.log(err);
// });

// write out our graph object
outputFile = 'blocks-function-graph.json';
outputJsonObj = outputData;
jf.writeFile(outputFile, outputJsonObj, { spaces: 2 }, function(err) {
  console.log(err);
});
