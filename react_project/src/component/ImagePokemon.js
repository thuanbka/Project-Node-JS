import React, { Component } from "react";
class ImagePokemon extends Component {
  constructor(props) {
    super(props);
    let src =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
      this.props.pokemon.id +
      ".png";
    this.state = {
      name: this.props.pokemon.name,
      src: src,
      id: this.props.pokemon.id,
      type: this.props.pokemon.type,
    };
  }
  render() {
    const colors = {
      fire: "orange",
      grass: "#DEFDE0",
      electric: "yellow",
      water: "#DEF3FD",
      ground: "#f4e7da",
      rock: "#d5d5d4",
      fairy: "#fceaff",
      poison: "#98d7a5",
      bug: "#f8d5a3",
      dragon: "#97b3e6",
      psychic: "#eaeda1",
      flying: "#F5F5F5",
      fighting: "#E6E0D4",
      normal: "#F5F5F5",
    };
    return (
      <div
        className="pokemon"
        style={{ backgroundColor: colors[this.state.type] }}
      >
        <div className="img-container">
          <img src={this.state.src} alt={this.state.name} />
        </div>
        <div className="info">
          <span className="number"> #{this.state.id} </span>
          <h3 className="name"> {this.state.name} </h3>
          <small className="type">
            Type: <span> {this.state.type} </span>
          </small>
        </div>
      </div>
    );
  }
}
export default ImagePokemon;
