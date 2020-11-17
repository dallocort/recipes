import axios from "axios";
import { key, proxy } from "../config";

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    try {

      this.result = (await axios(`https://api.spoonacular.com/food/products/search?query=${this.query}&apiKey=${key}`)).data.recipes;
    } catch (err) {
      console.log(`ima neka greška koda axiosa ${err}`);
    }
  }
}
