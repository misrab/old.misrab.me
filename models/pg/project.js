module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Project", 
  	{
  		title:			{ type: DataTypes.STRING },
		description:	{ type: DataTypes.STRING },
		link:  			{ type: DataTypes.STRING }, // a url link to somewhere
		static_url:  	{ type: DataTypes.STRING }	// a static file on S3 if any
	});
}