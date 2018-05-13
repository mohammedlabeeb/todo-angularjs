/*global angular */

/**
 * Directive that executes an expression when the element it is applied to gets
 * an `tab` keydown event.
 */
angular.module('todomvc')
    .directive('todoTab', function () {
        'use strict';

        var TAB_KEY = 9;

        return function (scope, elem, attrs) {
            elem.bind('keydown', function (event) {
                if (event.keyCode === TAB_KEY) {
                    scope.$apply(attrs.todoTab);
                }
            });

            scope.$on('$destroy', function () {
                elem.unbind('keydown');
            });
        };
    });