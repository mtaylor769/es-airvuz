describe('Index', function () {

  var index = require('../../client/scripts/index');

  describe('#add', function () {

    it('should add two numbers', function () {

      var testValues = [
          [1,2,3],
          [3,4,7],
          [0,0,0],
          [1,3,4]
          // ...
      ];

      testValues.forEach(function (values) {
        expect(index.add(values[0],values[1])).toBe(values[2]);
      });

    });

  });

});