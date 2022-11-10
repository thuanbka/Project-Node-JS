import Pokemon from "./entitys/Pokemon";
class Service {
    getDataPokemon(x) {
        let data = new Pokemon()
        return fetch("https://pokeapi.co/api/v2/pokemon/" + x, {
                method: "GET",
            })
            .then((res) => res.json())
            .then(
                (res) => {
                    data.id = res.id;
                    data.name = res.name;
                    data.type = res.types[0].type.name;
                    return data;
                },
                (error) => {
                    console.log(error);
                    return error
                }
            );
    }
}
export default Service;