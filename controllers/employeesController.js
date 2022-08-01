const Employee = require("../model/Employee");

//GET ALL EMPLOYEES
const getAllEmployees = async (req, res) => {
  const employees = await Employee.find(); //calling the find method returns all the employees
  if (!employees)
    return res.status(204).json({ message: "No employees found" });
  res.json(employees);
};

//CREATE AN EMPLOYEE
const createNewEmployee = async (req, res) => {
  const { firstname, lastname } = req?.body;
  if (!(firstname && lastname))
    return res
      .status(400)
      .json({ message: "Firstname and Lastname are required" });

  try {
    const result = await Employee.create({
      firstname: firstname,
      lastname: lastname,
    });
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
};

//UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID parameter is required" });

  const employee = await Employee.findOne({ _id: req.body.id }).exec();

  if (!employee) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.body.id}.` });
  } else {
    const firstname = req.body.firstname
      ? req.body.firstname
      : employee.firstname;
    const lastname = req.body.lastname ? req.body.lastname : employee.lastname;

    employee.firstname = firstname;
    employee.lastname = lastname;
    const result = await employee.save();

    // const result = await Employee.updateOne(
    //   { _id: req.body.id },
    //   { $set: { firstname: firstname, lastname: lastname } }
    // );

    return res.status(200).json(result);
  }
};

//DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  const { id } = req?.body;
  if (!id)
    return res
      .status(400)
      .json({ message: "Employee ID parameter is required" });
  const employee = await Employee.findOne({ _id: id }).exec();

  if (!employee) {
    return res.status(204).json({ message: `No employee matches ID ${id}.` });
  }
  const result = await Employee.deleteOne({ _id: id }); //we do not need an exec after deleteOne command from the docs
  res.json(result);
};

//GET ONE EMPLOYEE
const getEmployee = async (req, res) => {
  const { id } = req?.params;
  if (!id) return res.status(400).json({ message: "Employee ID required" });
  const employee = await Employee.findOne({ _id: id }).exec();

  if (!employee) {
    return res
      .status(204)
      .json({ message: `No Employee matches ID ${req.params.id}` });
  }

  res.status(200).json(employee);
};

module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};
