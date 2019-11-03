export const elements = {
  searchInput: document.querySelector(".search__field"),
  searchForm: document.querySelector(".search"),
  searchResList: document.querySelector(".results__list"),
  searchRes: document.querySelector(".results"),
  searchResPages: document.querySelector(".results__pages"),
  recipe: document.querySelector(".recipe"),
  shopping: document.querySelector(".shopping__list"),
  likesMenu: document.querySelector(".likes__field"),
  likesList: document.querySelector(".likes__list")
};
export const elementStrings = {
  loader: "loader"
};
export const renderLoader = parent => {
  const loader = `
    <div class="${elementStrings.loader}">
      <svg>
       <use href="./imgs/icons.svg#icon-cw"></use>
      </svg>
    </div>
  `;

  parent.insertAdjacentHTML("afterbegin", loader);
};
export const clearLoader = () => {
  //selektovanje elementa će se desiti kad se pozove ova funkcija ne pre
  // zato što loader nije uvek prisutan na html stranici nego ćemo
  //pozvati funkciju onda kad znamo da je loader prisutan na stranici
  const loader = document.querySelector(`.${elementStrings.loader}`);
  if (loader) loader.parentElement.removeChild(loader);
};
