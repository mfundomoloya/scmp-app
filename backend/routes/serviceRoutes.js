const express = require('express');
const router = express.Router();
const Service = require('../models/Service'); // Ensure this path is correct

// Create a new service
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    const newService = new Service({ name, description });

    try {
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        res.status(400).json({ message: 'Error creating service', error });
    }
});

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
});

// Get a single service by ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error });
    }
});

// Update a service by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(400).json({ message: 'Error updating service', error });
    }
});

// Delete a service by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
});

module.exports = router;