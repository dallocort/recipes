import axios from "axios";
import { key, proxy } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`${proxy}/https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);

      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }
  calcTime() {
    //pretpostavka 15min po svaka 3 sastojka
    const numIng = this.ingredients.length;
    const period = Math.ceil(numIng / 3);
    this.time = period * 15;
  }
  calcServings() {
    this.servings = 4;
  }
  parseIngredients() {
    //oprimeti da ovde reči množine treba da su pre jednine, u smislu
    //tablespoons pa onda tablespoon u nizu. zato što kad prvo naiđe na množinu reč on ce da je zameni sa jedninom umesto sa množinom pa se dešava da kad zameni ostane 's' na kraju što posle daje pogrešan rezultat
    const unitsLong = ["tablespoons", "tablespoon ", "ounces", "ounce", "teaspoons", "teaspoon", "cups", "pounds"];
    const unitsShort = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "cup", "pound"];
    const units = [...unitsShort, "kg", "g"];
    const newIngredients = this.ingredients.map(el => {
      // uniform units

      let ingredient = el.toLowerCase();

      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      //remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      //parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");

      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        //there is unit
        //Ex. 4 1/2 cups, arrCount is [4, 1/2]  --> eval('4+1/2') = 4,5
        //Ex. 4 cups, arrCount is [4]
        const arrCount = arrIng.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          if (
            arrIng
              .slice(0, unitIndex)
              .join("+")
              .includes("+to+")
          ) {
            //ovaj poslednji replace je kad imamo '1 to 3' pa eval ne može sabrati
            //1 + to + 3 dobije se error ali ovako će da sabira 1 + 3 =4 sto nije
            //tačno nego treba 1 - 3, problem nastaje kod id #acaff5
            count = arrIng
              .slice(0, unitIndex)
              .join("+")
              .replace("+to+", "-");
          } else {
            count = eval(
              arrIng
                .slice(0, unitIndex)
                .join("+")
                .replace("+to", "")
            );
          }
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        //there is no unit but 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        //there is no unit and no number at 1st position
        objIng = {
          count: 1,
          unit: "",
          ingredient
          // ovo je isto kao: ingredient =  ingredient
        };
      }
      return objIng;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    //ingredients
    this.ingredients.forEach(ing => {
      ing.count *= newServings / this.servings;
    });
    this.servings = newServings;
  }
}
