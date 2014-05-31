module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Blogpost", 
    {
      title:            { type: DataTypes.STRING },
      description:      { type: DataTypes.STRING },
      content:          { type: DataTypes.TEXT }
  });
}