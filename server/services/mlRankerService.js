import axios from "axios";
import { getAiServiceUrl } from "../utils/urlHelper.js";

export const getMLRankScore = async (features) => {
    const res = await axios.post(
        `${getAiServiceUrl()}/rank`,
        features
    );
    return res.data.rankScore;
};
