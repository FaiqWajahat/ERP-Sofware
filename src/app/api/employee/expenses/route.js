


import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

import employeeExpense from '@/models/employeeExpenses';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query = {};
    
    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid employee ID' },
          { status: 400 }
        );
      }
      query.employeeId = employeeId;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      employeeExpense.find(query)
        .populate('employeeId', 'name iqamaNumber role')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      employeeExpense.countDocuments(query)
    ]);

    // Calculate summary
    const summary = await employeeExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        summary: summary[0] || { totalAmount: 0, totalCount: 0 },
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}