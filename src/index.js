import "./style.css";
import "./img/icons.svg";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import Search from "./models/Search";
import { elements, renderLoader, clearLoader } from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

const state = {};

/*-----------------------------------------------------------------*/
const controlSearch = async () => {
  //1) get query from input
  const query = searchView.getInput();

  if (query) {
    //2.) new search object
    state.search = new Search(query);

    //3.) prepare UI for result
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      //4.) search for recipe
      await state.search.getResults();

      //5.) render results on UI
      clearLoader();

      if (state.search.result.length === 0) {
        //ovde pisati kod šta ako se ne vrati ništa od search queryija
        state.search.result[0] = {
          title: "No results",
          recipe_id: "",
          image_url: "favicon.png",
          publisher: "try different search"
        };
        searchView.renderResults(state.search.result);
      } else {
        searchView.renderResults(state.search.result);
      }
    } catch (error) {
      console.log(`error kod prikaza rezultata ${error}`);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});
/*-----------------------------------------------------------------*/

/*-----------------------------------------------------------------*/
const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");
  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    //Highlight selected search item

    if (state.search) {
      searchView.highlightSelected(id);
    }

    //create new recipe
    state.recipe = new Recipe(id);
    try {
      await state.recipe.getRecipe();

      //console.dir(JSON.parse(JSON.stringify(state.recipe.ingredients)));
      state.recipe.parseIngredients();
      //console.dir(state.recipe.ingredients);

      state.recipe.calcTime();
      state.recipe.calcServings();

      //Render recipe
      clearLoader();

      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error, "-------------------------error kod procesiranja recepta");
    }
  }
};

//window.addEventListener("hashchange", controlRecipe);
//window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

const controlList = () => {
  //create a new list IF there is  none yet
  if (!state.list) state.list = new List();

  //add each ingredients to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//handle delete and update list item events
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle delete btn
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // delete fron state
    state.list.deleteItem(id);
    //delete fron ui
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

//-----------------------------------------

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  if (!state.likes.isLiked(currentID)) {
    //add like to the state

    const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
    likesView.renderLike(newLike);
    //toggle the like btn
    likesView.toggleLikeBtn(true);
  } else {
    //
    state.likes.deleteLike(currentID);
    likesView.deleteLike(currentID);
    likesView.toggleLikeBtn(false);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipes on page load
window.addEventListener("load", () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  state.likes.likes.forEach(likesView.renderLike);
});

//handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    //add ingredient to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //like constroler

    controlLike();
  }
});
