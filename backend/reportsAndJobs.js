const crypto = require("crypto");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const Transaction = require("./models/Transaction");
const { runRecurringTransactions, checkBudgetAlerts } = require("./cronJobs");

function requireJobSecret(req, res, next) {
  const secret = req.get("x-job-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length || a.length === 0 || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
}

async function exportCsv(req, res) {
  const rows = await Transaction.find().sort({ date: -1 }).lean();
  const parser = new Parser({ fields: ["date", "type", "category", "title", "amount"] });
  const csv = parser.parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment("transactions-report.csv");
  return res.send(csv);
}

async function exportPdf(req, res) {
  const rows = await Transaction.find().sort({ date: -1 }).lean();
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="transactions-report.pdf"');
  doc.pipe(res);

  doc.fontSize(18).text("Transactions Report", { underline: true });
  doc.moveDown();

  rows.forEach((tx) => {
    const day = new Date(tx.date).toISOString().split("T")[0];
    doc.fontSize(11).text(`${day} | ${tx.type.toUpperCase()} | ${tx.category} | ${tx.title} | ${tx.amount}`);
  });

  doc.end();
}

async function triggerJobNow(req, res) {
  await runRecurringTransactions();
  await checkBudgetAlerts();
  return res.json({ message: "Scheduled jobs executed" });
}

module.exports = { requireJobSecret, exportCsv, exportPdf, triggerJobNow };
