import { elements } from "./base";
export const getInput = () => elements.searchInput.value;
export const clearInput = () => {
  //mogao sam staviti u jednom redu ali bi onda vratio implicitno
  //vrednost a to ne želim, zato stavljam u { } gde nemam return i ne vraća vrednost
  //baš kako mi i treba
  elements.searchInput.value = "";
};
export const clearResults = () => {
  elements.searchResList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
  const resultsArr = Array.from(document.querySelectorAll(".results__link--active"));
  resultsArr.forEach(el => el.classList.remove("results__link--active"));
  const lista = document.querySelector(`.results__link[href="#${id}"]`);
  if (lista) lista.classList.add("results__link--active");
  //ova provera je jer kad kliknem iz like liste tada može se
  //desiti da ne postoji element sa href=id jer tipa likovao sam pizzu a na stranici sam paste, te nema pizze da highlite
};
export const limitRecipeTitle = (title, limit = 17) => {
  const newtitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newtitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    return `${newtitle.join(" ")} ...`;
  }
  return title;
};
const renderRecipe = recipe => {
  const markup = `
                <li>
                    <a class="results__link" href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src="${recipe.image_url}" alt="${recipe.title}">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${limitRecipeTitle(recipe.title, 20)}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>
    `;

  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};
const createButton = (page, type) => `  
  <button class="btn-inline results__btn--${type}" data-goto=${type === "prev" ? page - 1 : page + 1}>
  <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
      <svg class="search__icon">
          <use href="imgs/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
      </svg>
  </button>`;
const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;
  if (page === 1 && pages > 1) {
    //only button to next page, ne zelimo button ako ima jedna strana
    button = createButton(page, "next");
  } else if (page < pages) {
    //both buttons
    button = `
    ${createButton(page, "next")}
    ${createButton(page, "prev")}
    `;
  } else if (page === pages && pages > 1) {
    //only buttom to revious page
    button = createButton(page, "prev");
  }
  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);

  renderButtons(page, recipes.length, resPerPage);
};
