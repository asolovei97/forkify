import { API_URL, KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
	recipe: {},
	search: {
		query: '',
		results: [],
		resultsPerPage: RES_PER_PAGE,
		page: 1
	},
	bookmarks: []
};

const createRecipeObject = function(data) {
	const { recipe } = data.data;
	return {
		id: recipe.id,
		title: recipe.title,
		publisher: recipe.publisher,
		sourceUrl: recipe.source_url,
		image: recipe.image_url,
		servings: recipe.servings,
		cookingTime: recipe.cooking_time,
		ingredients: recipe.ingredients,
		...(recipe.key && { key: recipe.key }),
	};
}

export const loadRecipe = async function(recipeId) {
	try {
		const data = await AJAX(`${API_URL}${recipeId}?key=${KEY}`);

		state.recipe = createRecipeObject(data);

		if (state.bookmarks.some(bookmark => bookmark.id === recipeId)) state.recipe.bookmarked = true;

		else state.recipe.bookmarked = false;
	} catch (error) {
		throw error;
	}
};

export const loadSearchResults = async function(query) {
	try {
		state.search.query = query;

		const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
		state.search.results = data.data.recipes.map(recipe => ({
			id: recipe.id,
			title: recipe.title,
			publisher: recipe.publisher,
			image: recipe.image_url,
			...(recipe.key && { key: recipe.key }),
		}));
		state.search.page = 1;
	} catch (error) {
		throw error;
	}
};

export const getSearchResultsPage = function(page = state.search.page) {
	state.search.page = page;

	const start = (page - 1) * state.search.resultsPerPage; //0
	const end = page * state.search.resultsPerPage; //9

	return state.search.results.slice(start, end);
};

const persistBookmarks = function() {
	localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const updateServings = function(newServings) {
	state.recipe.ingredients.forEach(ingredient => {
		ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.servings;
	});

	state.recipe.servings = newServings;
};

export const addBookmark = function(recipe) {
	// Add bookmark
	state.bookmarks.push(recipe);

	// Mark current recipe as bookmarked
	if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

	persistBookmarks();
};

export const deleteBookmark = function(recipeId) {
	const index = state.bookmarks.findIndex(bookmark => bookmark.id === recipeId);

	// Delete bookmark
	state.bookmarks.splice(index, 1);

	// Mark current recipe as NOT bookmarked
	if (state.recipe.id === recipeId) state.recipe.bookmarked = false;

	persistBookmarks();
};

export const uploadRecipe = async function(newRecipe) {
	try {
		const ingredients = Object.entries(newRecipe)
			.filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
			.map(ingredient => {
				const ingredientsArray = ingredient[1]
					.split(',')
					.map(el => el.trim());
				if (ingredientsArray.length !== 3) throw new Error("Wrong ingredients format! Please use correct format 😊");
				const [quantity, unit, description] = ingredientsArray;
				return { quantity: quantity ? +quantity : null, unit, description };
			});

		const recipe = {
			title: newRecipe.title,
			source_url: newRecipe.sourceUrl,
			image_url: newRecipe.image,
			publisher: newRecipe.publisher,
			cooking_time: +newRecipe.cookingTime,
			servings: +newRecipe.servings,
			ingredients,
		}

		const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

		state.recipe = createRecipeObject(data);
		addBookmark(state.recipe);
	} catch (error) {
		throw error;
	}
};

const init = function() {
	const storage = localStorage.getItem('bookmarks');
	if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function() {
	localStorage.clear('bookmarks');
};

// clearBookmarks();
