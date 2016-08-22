(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('userEmployeeController', userEmployeeController);

    userEmployeeController.$inject = ['$http'];

    function userEmployeeController($http) {

        function getEmployeeReport(startDate, endDate) {
            vm.siteInfo = false;
            vm.videos = false;
            vm.comments = false;
            vm.loading = true;
            vm.employeeReport = false;
            var dateObject = {};
            dateObject.startDate = startDate;
            dateObject.endDate = endDate;
            $http.post('/api/reports/employee-contributor', dateObject)
                .success(function(data) {
                    vm.employees = data;
                    vm.employeeReport = true;
                    vm.loading = false;
                })
        }

    ////////////////////////////
        var vm = this;
        vm.getEmployeeReport = getEmployeeReport;
        vm.employeeReportInput = true;
    }
})();