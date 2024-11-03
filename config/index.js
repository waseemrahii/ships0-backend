import dotenv from "dotenv";

dotenv.config();

const config = {
	port: process.env.PORT || 3000,
	dbURI: process.env.DB_URI,
	jwtSecret: process.env.JWT_SECRET,
	jwtAccessTime: process.env.JWT_ACCESS_TIME,
	 // S3 BUCKET KEYS
	 AWSS3BucketName: process.env.AWS_S3_BUCKET_NAME,
	 AWSAccessId: process.env.AWS_ACCESS_ID,
	 AWSSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 
};

export default config;



