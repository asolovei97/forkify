import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView';
import addRecipeView from './views/addRecipeView';
import { MODAL_CLOSE_SECONDS } from './config';
import { state } from './model.js';

// if (module.hot) {
// 	module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
	try {
		const recipeId = window.location.hash.slice(1);

		if (!recipeId) return;
		recipeView.renderSpinner();

		// 0 Update results view and bookmarks view to mark selected search results page
		resultsView.update(model.getSearchResultsPage());
		bookmarksView.update(model.state.bookmarks);

		// 1) Loading Recipe
		await model.loadRecipe(recipeId);

		// 2) Render Recipe
		recipeView.render(model.state.recipe);
	} catch (error) {
		console.error(error);
		recipeView.renderError();
	}
};

const controlSearchResults = async function() {
	try {
		resultsView.renderSpinner();
		// 1) Get search query
		const query = searchView.getQuery();
		if (!query) return;

		// 2) Load search results
		await model.loadSearchResults(query);

		// 3) Render results
		resultsView.render(model.getSearchResultsPage());

		// 4) Render pagination buttons
		paginationView.render(model.state.search);
	} catch (error) {
		console.error(error);
	}
};

const controlPagination = function(page) {
	// 1) Render NEW results
	resultsView.render(model.getSearchResultsPage(page));

	// 2) Render NEW pagination buttons
	paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
	// Update the recipe servings (in state);
	model.updateServings(newServings);

	// Update the recipe View;
	recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
	// 1) Add/Remove bookmarks
	if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
	else model.deleteBookmark(model.state.recipe.id);

	// 2) Update recipe view
	recipeView.update(model.state.recipe);

	// 3) Render bookmarks
	bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
	bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
	try {
		// Show loading spinner
		addRecipeView.renderSpinner();

		// Upload newRecipe
		await model.uploadRecipe(newRecipe);
		console.log(model.state.recipe);

		// Render recipe
		recipeView.render(model.state.recipe);

		// Success Message
		addRecipeView.renderMessage();

		// Render bookmark view
		bookmarksView.render(model.state.bookmarks);

		// Change ID in URL
		window.history.pushState(null, "", `#${state.recipe.id}`);

		// Close form window
		setTimeout(function() {
			addRecipeView.toggleWindow()
		}, MODAL_CLOSE_SECONDS * 1000)

	} catch (error) {
		console.error(error);
		addRecipeView.renderError(error.message);
	}
};

const init = function() {
	bookmarksView.addHandlerRender(controlBookmarks);
	recipeView.addHandlerRender(controlRecipes);
	recipeView.addHandlerUpdateServings(controlServings);
	recipeView.addHandlerBookmark(controlAddBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
	addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();