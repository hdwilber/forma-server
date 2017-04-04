'use strict';

module.exports = function () {
  TYPES = [
  {
    code: 'field',
    types: [
      {
        'code': 'text',
        'name': 'Text'
        subTypes: [{
          'code': 'small',
          'name': 'Small Text'
        }]
      },
      {
        code: 'numeric',
        name: "Numeric Data",
        subTypes: 
          [{
            code: 'integer',
            name: 'Integer Number'
          }, {
            code: 'real',
            name: 'Real Number'
          }
        ]
      }
    ]
  }, {
    code: 'selection',
    types: 
      [{ 
        'code': 'simple',
        'name': 'Selection Simple',
        subTypes: [
          {
            code: 'simple',
            name: 'Simple Selection'
        }]
      }]
  }, {
    code: 'geo',
    types: [
      {
        code: 'point',
        name: 'Simple Point',
        subTypes: [ 
          {
            code: 'location',
            name: 'Geo Location'
          }
        ]
      }
    ]
  }]
};
