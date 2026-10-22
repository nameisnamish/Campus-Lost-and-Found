require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const Student = require('./models/Student');
const LostItem = require('./models/LostItem');
const FoundItem = require('./models/FoundItem');
const { getValidationMessage, isValidObjectId, requiredText } = require('./lib/validation');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

function renderError(res, status, message) {
  return res.status(status).render('error', { title: 'Error', message });
}

function dateValue(value) {
  return value ? new Date(value) : null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/', (req, res) => {
  res.render('home', { title: 'Campus Lost & Found' });
});

app.get('/students/new', (req, res) => {
  res.render('students/new', { title: 'Create Student Profile', error: null, form: {} });
});

app.post('/students', async (req, res) => {
  const form = {
    fullName: req.body.fullName,
    email: req.body.email,
    department: req.body.department,
    contactNumber: req.body.contactNumber
  };

  try {
    const student = await Student.create(form);
    res.redirect(`/students/${student._id}`);
  } catch (error) {
    res.status(error.code === 11000 || error.name === 'ValidationError' ? 400 : 500)
      .render('students/new', {
        title: 'Create Student Profile',
        error: getValidationMessage(error),
        form
      });
  }
});

app.get('/students/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The student ID is invalid.');
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return renderError(res, 404, 'Student profile not found.');
    }
    return res.render('students/show', { title: student.fullName, student });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/lost-items/new', async (req, res) => {
  const students = await Student.find().sort({ fullName: 1 });
  res.render('lost-items/new', { title: 'Report Lost Item', error: null, form: {}, students });
});

app.post('/lost-items', async (req, res) => {
  const form = { ...req.body };
  try {
    if (!isValidObjectId(form.reportedBy)) {
      throw Object.assign(new Error('Reporting student ID is invalid.'), { status: 400 });
    }
    const student = await Student.findById(form.reportedBy);
    if (!student) {
      throw Object.assign(new Error('The reporting student does not exist.'), { status: 400 });
    }
    if (!requiredText(form.itemName) || !requiredText(form.category) ||
        !requiredText(form.description) || !requiredText(form.lastSeenLocation)) {
      throw Object.assign(new Error('All lost-item fields are required.'), { status: 400 });
    }
    const item = await LostItem.create({ ...form, dateLost: dateValue(form.dateLost) });
    res.redirect(`/lost-items/${item._id}`);
  } catch (error) {
    const students = await Student.find().sort({ fullName: 1 });
    res.status(error.status || 500).render('lost-items/new', {
      title: 'Report Lost Item',
      error: error.status ? error.message : getValidationMessage(error),
      form,
      students
    });
  }
});

app.get('/lost-items', async (req, res) => {
  try {
    const filter = {};
    if (requiredText(req.query.search)) {
      const search = escapeRegex(req.query.search.trim());
      filter.$or = [
        { itemName: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { lastSeenLocation: new RegExp(search, 'i') }
      ];
    }
    const items = await LostItem.find(filter).populate('reportedBy').sort({ dateLost: -1 });
    res.render('lost-items/index', {
      title: 'Lost Items',
      items,
      search: req.query.search || ''
    });
  } catch (error) {
    renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/lost-items/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The lost-item ID is invalid.');
  }
  try {
    const item = await LostItem.findById(req.params.id).populate('reportedBy');
    if (!item) {
      return renderError(res, 404, 'Lost-item report not found.');
    }
    return res.render('lost-items/show', { title: item.itemName, item });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/found-items/new', async (req, res) => {
  const students = await Student.find().sort({ fullName: 1 });
  res.render('found-items/new', { title: 'Report Found Item', error: null, form: {}, students });
});

app.post('/found-items', async (req, res) => {
  const form = { ...req.body };
  try {
    if (!isValidObjectId(form.reportedBy)) {
      throw Object.assign(new Error('Reporting student ID is invalid.'), { status: 400 });
    }
    const student = await Student.findById(form.reportedBy);
    if (!student) {
      throw Object.assign(new Error('The reporting student does not exist.'), { status: 400 });
    }
    if (!requiredText(form.itemName) || !requiredText(form.category) ||
        !requiredText(form.description) || !requiredText(form.foundLocation)) {
      throw Object.assign(new Error('All found-item fields are required.'), { status: 400 });
    }
    const item = await FoundItem.create({ ...form, dateFound: dateValue(form.dateFound) });
    res.redirect(`/found-items/${item._id}`);
  } catch (error) {
    const students = await Student.find().sort({ fullName: 1 });
    res.status(error.status || 500).render('found-items/new', {
      title: 'Report Found Item',
      error: error.status ? error.message : getValidationMessage(error),
      form,
      students
    });
  }
});

app.get('/found-items', async (req, res) => {
  try {
    const items = await FoundItem.find().populate('reportedBy').sort({ dateFound: -1 });
    res.render('found-items/index', { title: 'Found Items', items });
  } catch (error) {
    renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/found-items/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The found-item ID is invalid.');
  }
  try {
    const item = await FoundItem.findById(req.params.id).populate('reportedBy');
    if (!item) {
      return renderError(res, 404, 'Found-item report not found.');
    }
    return res.render('found-items/show', { title: item.itemName, item });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.use((req, res) => renderError(res, 404, 'The page you requested was not found.'));

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and set it.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Campus Lost & Found running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start application: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
