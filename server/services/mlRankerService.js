import axios from "axios";

export const getMLRankScore = async (features) => {
    const res = await axios.post(
        `${process.env.AI_SERVICE_URL}/rank`,
        features
    );
    return res.data.rankScore;
};
