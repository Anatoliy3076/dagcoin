(() => {
  'use strict';

  const fs = require('fs');

  /**
   * @desc Transactions table
   * @example <dag-transactions-table></dag-transactions-table>
   */
  angular
    .module('copayApp.directives')
    .directive('dagTransactionsTable', dagTransactionsTable);

  dagTransactionsTable.$inject = ['moment', 'exportTransactions', 'isCordova', '$timeout', '$rootScope'];

  function dagTransactionsTable(moment, exportTransactions, isCordova, $timeout, $rootScope) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/dagTransactionsTable/dagTransactionsTable.template.html',
      scope: {
        rows: '='
      },
      link: ($scope) => {
        const today = moment().format('DD/MM/YYYY');
        const yesterday = moment().subtract(1, 'day').format('DD/MM/YYYY');
        $scope.isCordova = isCordova;
        $scope.transactions = {};
        $scope.total_transactions = 0;
        $scope.visible_rows = 0;
        $scope.limit = 10;

        $scope.exportToCsv = () => {
          if (!$scope.exporting) {
            $scope.exporting = true;
            exportTransactions.toCSV().then(() => {
              $timeout(() => {
                $scope.exporting = false;
              }, 500);
            });
          }
        };

        $scope.openTransaction = (transaction) => {
          $rootScope.openTxModal(transaction, $scope.rows);
        };

        $scope.formatDate = (value) => {
          if (value === today) {
            return 'Today';
          } else if (value === yesterday) {
            return 'Yesterday';
          }
          return value;
        };

        $scope.statusIcon = (status) => {
          if (status === 'received') {
            return 'call_received';
          } else if (status === 'pending') {
            return 'autorenew';
          }
          return 'call_made';
        };

        function filterRows() {
          for (let x = 0, maxLen = $scope.total_transactions; x < maxLen; x++) {
            if (x >= $scope.visible_rows && x <= $scope.limit) {
              const t = $scope.rows[x];
              console.log(t);
              if (!t.isFundingNodeTransaction) {
                const timestamp = t.time * 1000;
                const date = moment(timestamp).format('DD/MM/YYYY');

                if (!$scope.transactions[date]) {
                  $scope.transactions[date] = [];
                }

                $scope.transactions[date].push(t);
                $scope.visible_rows += 1;
              }
            }
          }
        }

        $scope.$watch('rows', () => {
          if ($scope.rows.length > 0) {
            $scope.total_transactions = $scope.rows.length;
            filterRows();
          }
        });

        $scope.increaseLimit = () => {
          $scope.limit += 10;
          filterRows();
        };
      }
    };
  }
})();