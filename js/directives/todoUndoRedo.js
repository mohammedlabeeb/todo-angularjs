/*global angular */

/**
 * Directive that executes an expression when the element it is applied to gets
 * an `cntrl + z` and `cntrl + y` keydown event.
 */
angular.module('todomvc')
    .directive('todoUndoRedo', ['$window', function ($window) {
        'use strict';

        var CNTRL_KEY = 17;
        var UNDO_KEY = 90;
        var REDO_KEY = 89;

        return {
            restrict: "A",
            scope: false,
            link: function (scope, elem, attrs) {
                var action = '';
                scope.ctrlPressed = false;
                angular.element($window).bind("keyup", function (event) {
                    if (event.keyCode === CNTRL_KEY)
                        scope.ctrlPressed = false;
                    scope.$apply();
                });

                angular.element($window).bind("keydown", function (event) {
                    action = '';
                    if (event.keyCode === CNTRL_KEY)
                        scope.ctrlPressed = true;
                    if (scope.ctrlPressed && event.keyCode === UNDO_KEY)
                        action = 'undo';
                    if (scope.ctrlPressed && event.keyCode === REDO_KEY)
                        action = 'redo';
                    if (action) {
                        scope.undoRedoChanges(action);
                    }
                    scope.$apply();
                });

                scope.$on('$destroy', function () {
                    angular.element($window).unbind("keydown");
                    angular.element($window).unbind("keyup");
                });
            }
        }
    }]);