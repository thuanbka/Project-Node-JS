import React, { Component } from "react";
import ImagePokemon from "./ImagePokemon";
import Service from "../Service";
class Pokedex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      length: 900,
    };
    this.service = new Service();
  }

  async recursive(datas) {
    let hasContinue = datas.length < this.state.length;
    let x = datas.length;
    for (let i = 1; i < 50; i++) {
      if (x + i > this.state.length) {
        break;
      }
      await this.service.getDataPokemon(x + i).then(
        (res) => {
          datas.push(res);
        },
        (error) => {
          hasContinue = 0;
        }
      );
      if (hasContinue) {
        break;
      }
    }
    this.setState({ datas: datas });
    if (hasContinue) {
      this.recursive(datas);
    }
  }
  componentDidMount() {
    this.recursive([]);
  }

  render() {
    return (
      <div className="Pokedex">
        <h1> Pokedex </h1>
        <div className="poke-container" id="poke-container">
          {this.state.datas.map((item) => (
            <ImagePokemon key={item.id} pokemon={item} />
          ))}
        </div>
      </div>
    );
  }
}
export default Pokedex;
