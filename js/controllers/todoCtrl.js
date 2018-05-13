/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store) {
		'use strict';

		var todos = $scope.todos = store.todos;
		var todoHistory = [angular.copy(todos)];
		var activeHistoryIndex = todoHistory.length - 1;

		$scope.newTodo = '';
		$scope.editedTodo = null;

		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(todos, {
				completed: false
			}).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ? {
				completed: false
			} : (status === 'completed') ? {
				completed: true
			} : {};
		});

		$scope.addTodo = function () {
			var newTodo = {
				title: $scope.newTodo.trim(),
				completed: false
			};

			if (!newTodo.title) {
				return;
			}
			$scope.saving = true;
			store.insert(newTodo)
				.then(function success() {
					$scope.newTodo = '';
					addToHistory();
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event && tab press.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && ($scope.saveEvent === 'submit' || $scope.saveEvent === 'tab')) {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			todo.title = todo.title.trim();

			if (todo.title === $scope.originalTodo.title) {
				if (event !== 'tab') {
					$scope.editedTodo = null;
				} else {
					$scope.gotoNext(todo);
				}
			}

			store[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {
					addToHistory();
				}, function error() {
					todo.title = $scope.originalTodo.title;
				})
				.finally(function () {
					if (event !== 'tab') {
						$scope.editedTodo = null;
					} else {
						$scope.gotoNext(todo);
					}
				});
		};

		$scope.revertEdits = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
		};

		$scope.removeTodo = function (todo) {
			store.delete(todo).t;
			addToHistory();
		};

		$scope.saveTodo = function (todo) {
			store.put(todo);
			addToHistory();
		};

		$scope.toggleCompleted = function (todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			store.put(todo, todos.indexOf(todo))
				.then(function success() {
					addToHistory();
				}, function error() {
					todo.completed = !todo.completed;
				});
		};

		$scope.clearCompletedTodos = function () {
			store.clearCompleted();
			addToHistory();
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
		};

		$scope.gotoNext = function (todo) {
			var nextIndex = todos.indexOf(todo) === todos.length - 1 ? 0 : todos.indexOf(todo) + 1;
			this.editTodo(todos[nextIndex]);
		};

		$scope.undoRedoChanges = function (action) {
			if (action === 'undo' && todoHistory[activeHistoryIndex - 1]) {
				activeHistoryIndex--;
			} else if (action === 'redo' && todoHistory[activeHistoryIndex + 1]) {
				activeHistoryIndex++;
			}
			$scope.newTodo = '';
			if (!angular.equals(todos, todoHistory[activeHistoryIndex])) {
				store.set(todoHistory[activeHistoryIndex])
					.then(function success() {
						return true;
					});
			}
		};

		var addToHistory = function () {
			todoHistory.push(angular.copy(todos));
			activeHistoryIndex = todoHistory.length - 1;
		}

	});