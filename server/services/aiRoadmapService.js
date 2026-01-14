import axios from "axios";

export const generateRoadmap = async (courseName) => {
    const res = await axios.post(
        `${process.env.AI_SERVICE_URL}/generate-roadmap`,
        { 
            course_name: courseName,
            user_level: "beginner"
        }
    );
    return res.data;
};
