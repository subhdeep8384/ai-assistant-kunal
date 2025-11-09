import Summary from '../models/Summary.js';

export const getSummaries = async (req, res) => {
  console.log("indide get summariues")
  try {
    const userId =  req.user._id
 
    const summaries = await Summary.find({ userId: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Summaries fetched successfully',
      data: summaries[0].summaryText,
    });
    
  } catch (error) {
    console.error("❌ Fetch Summaries Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summaries',
      error: error.message,
    });
  }
};

// ✅ Delete a summary
export const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }

    if (summary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await summary.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Summary deleted successfully',
    });
  } catch (error) {
    console.error("❌ Delete Summary Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error deleting summary',
      error: error.message,
    });
  }
};

// ✅ Get summary stats (for dashboard)
export const getSummaryStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalSummaries = await Summary.countDocuments({ userId });

    res.status(200).json({
      success: true,
      message: 'Summary stats fetched successfully',
      data: { totalSummaries },
    });
  } catch (error) {
    console.error("❌ Summary Stats Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};
