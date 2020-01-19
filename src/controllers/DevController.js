const axios = require('axios');
const Dev =  require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket')

// index(listar), show(listar por id), store(criar), update(alterar), destroy(deletar)

module.exports = {
    async index (req, res) {
        const devs = await Dev.find();

        return res.json(devs);
    },

    async store (req, res) {
        const { github_username, techs, latitude, longitude } = req.body;

        let dev = await Dev.findOne({ github_username });

        if (!dev) {
            const apiRes = await axios.get(`https://api.github.com/users/${github_username}`);
        
            const { name = login, avatar_url, bio } = apiRes.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            });

            // Filtrar as conexões que estão há no máximo 10km
            // de distancia e que o novo dev tenha pelo menos
            // uma das tecnologias filtradas

            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
            )

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }
    
        return res.json(dev);
    },

    async update (req, res) {
        const { techs, latitude, longitude, name, avatar_url, bio } = req.body;
        const github_username = req.params.user;
        
        const techsArray = parseStringAsArray(techs);
    
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
    
        let message = {};
        await Dev.updateOne({ github_username }, { $set: {
            name,
            avatar_url,
            bio,
            techs: techsArray,
            location,
        }}, (err, res) => {
            if (err) throw err;
            console.log(res);
            if (res.n < 1) {
                message = {message: 'Desenvolvedor não localizado'};
            } else {
                message = {message: 'Informações atualizadas'};
            }
        });
        
        
        return res.json(message);
    },

    async destroy (req, res) {
        const github_username = req.params.user;

        let message = {};
        await Dev.deleteOne({ github_username }, (err, res) => {
            if (err) throw err;
            console.log(res);
            if (res.deletedCount < 1) {
                message = {message: 'Desenvolvedor não localizado'};
            } else {
                message = {message: 'Desenvolvedor removido'};
            }
        });
        
        return res.json(message);
    },
};