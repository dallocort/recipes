import axios from "axios";
import { key, proxy } from "../config";

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    try {
      // this.result = (await axios(`${proxy}/https://www.food2fork.com/api/search?key=${key}&q=${this.query}`)).data.recipes;
      this.result = (await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`)).data.recipes;
    } catch (err) {
      console.log(`ima neka greška koda axiosa ${err}`);
    }
  }
}
