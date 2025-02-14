import View from './View';
import previewView from './previewView';

class BookmarksView extends View {
	_parentElement = document.querySelector(".bookmarks__list");
	_errorMessage = "No bookmarks yet. Find a nice recipe and bookmark it :)"
	_successMessage = "";

	_generateMarkup() {
		return this._data.map(bookmark => previewView.render(bookmark, false)).join("");
	}

	addHandlerRender(handler) {
		window.addEventListener("load", handler)
	}
}

export default new BookmarksView;