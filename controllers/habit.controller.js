const Habit = require("../models/Habit")
const generateRandomString = require("../utils/generateRandomString.js")
const { format, differenceInDays } = require('date-fns'); 

module.exports.create = async (req, res) => {
  try {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'dd.MM.yy');

    let habit = await Habit.create({ 
        title: req.body.title,
        frequency: req.body.frequency,
        type: req.body.type,
        habitID: generateRandomString(20),
        authorID: req.body.authorID,
        dateOfCreated: formattedDate
    })

    let result = await habit.save()
    res.send(result)
  } catch (err) {
    console.log(err.message);
    res.status(400).send("error")
  }
}

module.exports.delete = async (req, res) => {
  await Habit.findOneAndDelete({habitID: req.query.id}).exec()
  res.status(204).send("Удалено")
}

module.exports.getHabitsList = async (req, res) => {
  let result = await Habit.find({authorID: req.query.authorID}).exec()
  if (result == null) res.status(404).send("Not Found")
  else res.send({item: result})
}

module.exports.getHabitsByType = async (req, res) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'dd.MM.yy');
  const formattedTimeWeek = format(currentDate, 'MM.yy');

  if (req.query.type == "daily") {
    let result = await Habit.find({type: req.query.type, authorID: req.query.authorID, dateOfCreated: formattedDate}).exec()
    if (result == null) res.status(404).send("Not Found")
    else res.send({ item: result })
  } else if (req.query.type == "weekly") {
    let result = await Habit.find({ type: req.query.type, authorID: req.query.authorID, dateOfCreated: { $regex: formattedTimeWeek, $options: 'i' } }).exec()
    if (result == null) res.status(404).send("Not Found")
    else {
      let arr = []
      for (let item of result) {
        const date1 = parse(formattedDate, 'dd.MM.yy', new Date());
        const date2 = parse(item.dateOfCreated, 'dd.MM.yy', new Date());
        if (differenceInDays(date1, date2) < 7) {
          arr.push(item)
        }
      }

      res.send({ item: arr })
    }
  }
  
  if (result == null) res.status(404).send("Not Found")
  else res.send({item: result})
}

module.exports.habitUpdate = async (req, res) => {
  let result = await Habit.findOne({habitID: req.body.habitID}).exec()
  if (result == null) res.status(404).send("Not Found")
  else {
    result.isDone = true
    await result.save()
    res.send(result)
  }
}
