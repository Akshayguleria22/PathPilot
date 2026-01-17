import axios from "axios";
import { getAiServiceUrl } from "../utils/urlHelper.js";

export const generateRoadmap = async (courseName) => {
    try {
        const aiServiceUrl = getAiServiceUrl();

        if (!aiServiceUrl) {
            throw new Error("AI service URL is not configured. Please set AI_SERVICE_URL environment variable.");
        }

        console.log(`🔄 Requesting roadmap for "${courseName}" from ${aiServiceUrl}`);

        const res = await axios.post(
            `${aiServiceUrl}/generate-roadmap`,
            {
                course_name: courseName,
                user_level: "beginner"
            },
            {
                timeout: 60000, // 60 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Successfully received roadmap with ${res.data?.steps?.length || 0} steps`);
        return res.data;

    } catch (error) {
        console.error(`❌ Error calling AI service:`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        // Provide more specific error messages
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`AI service is not reachable at ${getAiServiceUrl()}. Please check if the service is running.`);
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error('AI service request timed out. The service might be overloaded or down.');
        } else if (error.response?.status === 502) {
            throw new Error('AI service returned Bad Gateway (502). The service might be starting up or experiencing issues.');
        } else if (error.response?.status === 503) {
            throw new Error(error.response?.data?.detail || 'AI service is temporarily unavailable.');
        } else if (error.response?.status >= 500) {
            throw new Error(`AI service error: ${error.response?.data?.detail || error.message}`);
        }

        throw error;
    }
};
