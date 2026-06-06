const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

const isMockAI = () => {
  const key = process.env.GEMINI_API_KEY;
  return !key || key.startsWith('your_gemini_api_key') || key === '';
};

const getGenAI = () => {
  if (!genAI) {
    if (isMockAI()) {
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const mockSuggestFood = async (userMessage, menuItems) => {
  const msg = userMessage.toLowerCase();
  let filtered = [...menuItems];

  if (msg.includes('chay') || msg.includes('vegeter') || msg.includes('không thịt')) {
    filtered = filtered.filter(item => item.isVegetarian);
  }

  if (msg.includes('không hải sản') || msg.includes('dị ứng hải sản')) {
    filtered = filtered.filter(item => !item.containsSeafood);
  }

  if (msg.includes('cay')) {
    if (msg.includes('không cay') || msg.includes('ít cay') || msg.includes('không ăn cay')) {
      filtered = filtered.filter(item => item.spicyLevel === 0);
    } else {
      filtered = filtered.filter(item => item.spicyLevel > 0);
    }
  }

  let keywordFilter = [];
  if (msg.includes('sushi')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'sushi');
  } else if (msg.includes('sashimi')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'sashimi');
  } else if (msg.includes('ramen') || msg.includes('mì')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'ramen');
  } else if (msg.includes('bento') || msg.includes('cơm')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'bento');
  } else if (msg.includes('teppanyaki') || msg.includes('nướng')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'teppanyaki');
  } else if (msg.includes('đồ uống') || msg.includes('nước') || msg.includes('sake') || msg.includes('bia')) {
    keywordFilter = filtered.filter(item => item.category?.name?.toLowerCase() === 'do uong');
  }

  if (keywordFilter.length > 0) {
    filtered = keywordFilter;
  }

  if (filtered.length === 0) {
    filtered = menuItems.slice(0, 5);
  }

  const selected = filtered.sort((a, b) => b.isBestSeller - a.isBestSeller).slice(0, 4);

  let response = `Dựa trên sở thích của bạn ("${userMessage}"), tôi xin đề xuất các món ăn sau đây:\n\n`;
  selected.forEach((item, index) => {
    let reason = "Món ăn truyền thống đặc sắc, chuẩn hương vị Nhật Bản.";
    if (item.isVegetarian) reason = "Món chay thanh tịnh, giàu dinh dưỡng, rất thích hợp cho khẩu vị của bạn.";
    if (item.spicyLevel > 0) reason = "Vị cay ấm nồng kích thích vị giác, lý tưởng cho người thích ăn cay.";
    if (item.isBestSeller) reason = "Món bán chạy nhất tại nhà hàng, được rất nhiều thực khách yêu thích.";

    response += `${index + 1}. ${item.name}\n- Lý do phù hợp: ${reason}\n- Giá tiền: ${item.price.toLocaleString('vi-VN')} VND\n- Ghi chú: ${item.isAvailable ? 'Sẵn có' : 'Tạm hết món'}${item.spicyLevel > 0 ? `, Độ cay: ${item.spicyLevel}/3` : ''}\n\n`;
  });

  response += "Chúc bạn có trải nghiệm ẩm thực tuyệt vời tại Sakura! Bạn có muốn tôi tư vấn thêm về món nào khác không?";
  return response;
};

const mockAnalyzeBusinessData = async (question, businessData) => {
  const q = question.toLowerCase();
  let response = `Phân tích dữ liệu kinh doanh của nhà hàng Sakura:\n\n`;

  const stats = businessData.currentStats;
  const topItems = businessData.topItems;
  const peakHours = businessData.peakHours;

  const totalRev = stats?.totalRevenue?.toLocaleString('vi-VN') || '0';
  const totalInv = stats?.totalInvoices || 0;
  const avgVal = stats?.averageOrderValue?.toLocaleString('vi-VN') || '0';

  if (q.includes('doanh thu') || q.includes('tiền') || q.includes('bán được')) {
    response += `1. Tình hình Doanh thu:\n- Tổng doanh thu tháng này đạt: ${totalRev} VND.\n- Tổng số hóa đơn đã thanh toán: ${totalInv} đơn.\n- Giá trị trung bình trên mỗi hóa đơn: ${avgVal} VND.\n\n2. Nhận xét & Xu hướng:\n- Doanh thu duy trì ổn định qua các tuần. Giá trị hóa đơn trung bình tương đối tốt nhờ các set Omakase và các món Teppanyaki cao cấp.\n\n3. Đề xuất:\n- Nên triển khai thêm các chương trình khuyến mãi tăng doanh thu vào các ngày giữa tuần (thứ 3, thứ 4) vốn là các ngày có lượng khách thấp hơn.`;
  } else if (q.includes('bán chạy') || q.includes('món ăn') || q.includes('thích') || q.includes('món nào')) {
    const topList = topItems.map((item, idx) => `- Top ${idx + 1}: ${item.name} (${item.totalQuantity} phần, doanh thu ${item.totalRevenue?.toLocaleString('vi-VN')} VND)`).join('\n');
    response += `1. Danh sách các món bán chạy nhất:\n${topList}\n\n2. Phân tích thị hiếu:\n- Các món đặc trưng như Sushi và các món bò Wagyu Teppanyaki đang đóng góp lớn nhất vào cơ cấu doanh thu. Món Omakase Premium Set có lượng đặt ổn định nhờ chất lượng nổi bật.\n\n3. Đề xuất:\n- Đảm bảo nguồn nguyên liệu tươi ngon luôn sẵn sàng cho các món bán chạy này.\n- Có thể cân nhắc điều chỉnh tăng giá nhẹ khoảng 3-5% đối với các món cực kỳ được ưa chuộng hoặc làm mới menu bằng cách thêm các biến thể mới.`;
  } else if (q.includes('giờ') || q.includes('khung giờ') || q.includes('đông khách')) {
    const peakList = peakHours.sort((a, b) => b.count - a.count).slice(0, 3).map(h => `- ${h.label}: ${h.count} hóa đơn`).join('\n');
    response += `1. Khung giờ đông khách nhất tháng này:\n${peakList}\n\n2. Nhận xét vận hành:\n- Khách hàng tập trung chủ yếu vào giờ ăn trưa (12h-13h) và giờ ăn tối (18h-20h).\n- Khung giờ tối muộn sau 21h lượng khách giảm rõ rệt.\n\n3. Đề xuất:\n- Điều phối nhân sự phục vụ và bếp tập trung cao độ vào hai khung giờ cao điểm trên để tránh quá tải và giảm thời gian chờ đợi của khách.\n- Có thể tạo các combo giảm giá khung giờ thấp điểm (từ 14h - 17h) để thu hút thêm đối tượng khách hàng linh hoạt thời gian.`;
  } else {
    response += `1. Tổng quan vận hành tháng này:\n- Tổng doanh thu đạt: ${totalRev} VND.\n- Tổng số đơn phục vụ thành công: ${stats?.totalOrders || 0} đơn.\n- Số lượt đặt bàn: ${totalInv} lượt.\n\n2. Đánh giá chung:\n- Các chỉ số vận hành đang nằm trong mức an toàn và đạt kế hoạch đề ra. Hiệu suất phục vụ bếp tốt.\n\n3. Khuyến nghị:\n- Tiếp tục theo dõi sát sao phản hồi của khách hàng qua chatbot AI và tăng cường tối ưu hóa thực đơn dựa trên danh sách món bán chạy.`;
  }

  return response;
};

/**
 * Suggest food items based on customer preferences.
 * @param {string} userMessage - Customer's preference description
 * @param {Array} menuItems - Available menu items from database
 * @returns {Promise<string>} AI response text
 */
const suggestFood = async (userMessage, menuItems) => {
  try {
    if (isMockAI()) {
      return mockSuggestFood(userMessage, menuItems);
    }

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const menuSummary = menuItems
      .map((item) => {
        const tags = [];
        if (item.spicyLevel > 0) tags.push(`Cay muc ${item.spicyLevel}/3`);
        if (item.containsSeafood) tags.push('Co hai san');
        if (item.isVegetarian) tags.push('Chay');
        if (item.isBestSeller) tags.push('Ban chay');
        return `- [${item.category?.name || 'Khac'}] ${item.name}: ${item.price.toLocaleString('vi-VN')} VND${tags.length ? ` | ${tags.join(', ')}` : ''}${item.description ? ` | ${item.description}` : ''}`;
      })
      .join('\n');

    const prompt = `Ban la tro ly AI cua nha hang Nhat Ban. Nhiem vu cua ban la goi y mon an phu hop voi so thich cua khach hang.

Thuc don hien co:
${menuSummary}

So thich khach hang: ${userMessage}

Hay goi y 3-5 mon an phu hop nhat voi so thich cua khach. Voi moi mon, ghi ro:
1. Ten mon
2. Ly do phu hop voi so thich khach
3. Gia tien
4. Ghi chu dac biet (neu co)

Tra loi bang tieng Viet, than thien va ngan gon. Neu khach co yeu cau dac biet (khong an hai san, khong an cay...) thi chi goi y cac mon thoa man dieu kien do.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI suggestFood error:', error.message);
    throw new Error('Dich vu AI tam thoi khong kha dung. Vui long thu lai sau.');
  }
};

/**
 * Analyze business data and answer manager questions.
 * @param {string} question - Manager's question
 * @param {Object} businessData - Aggregated business data
 * @returns {Promise<string>} AI response text
 */
const analyzeBusinessData = async (question, businessData) => {
  try {
    if (isMockAI()) {
      return mockAnalyzeBusinessData(question, businessData);
    }

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const topItemsList = businessData.topItems
      .map((item, idx) => `${idx + 1}. ${item.name}: ${item.totalQuantity} phan, doanh thu ${item.totalRevenue?.toLocaleString('vi-VN')} VND`)
      .join('\n');

    const peakHoursList = businessData.peakHours
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((h) => `- ${h.label}: ${h.count} hoa don`)
      .join('\n');

    const recentDays = businessData.dailyRevenue
      .filter((d) => d.revenue > 0)
      .map((d) => `${d.date}: ${d.revenue.toLocaleString('vi-VN')} VND (${d.orders} don)`)
      .join('\n');

    const dataContext = `
Du lieu kinh doanh hien tai:

Thong ke thang nay:
- Tong doanh thu: ${businessData.currentStats?.totalRevenue?.toLocaleString('vi-VN') || 0} VND
- Tong so hoa don: ${businessData.currentStats?.totalInvoices || 0}
- Tong so don hang: ${businessData.currentStats?.totalOrders || 0}
- Gia tri trung binh moi hoa don: ${businessData.currentStats?.averageOrderValue?.toLocaleString('vi-VN') || 0} VND

Doanh thu 7 ngay gan nhat:
${recentDays || 'Chua co du lieu'}

Top mon ban chay thang nay:
${topItemsList || 'Chua co du lieu'}

Khung gio dong khach nhat:
${peakHoursList || 'Chua co du lieu'}

Doanh thu theo thang trong nam:
${businessData.monthlyRevenue?.map((m) => `${m.name}: ${m.revenue.toLocaleString('vi-VN')} VND`).join(', ') || 'Chua co du lieu'}
`;

    const prompt = `Ban la chuyen gia phan tich kinh doanh cua nha hang Nhat Ban. Hay phan tich du lieu va tra loi cau hoi cua quan ly.

${dataContext}

Cau hoi cua quan ly: ${question}

Hay tra loi day du va cu the, bao gom:
1. Tra loi truc tiep cau hoi
2. Phan tich cac xu huong quan trong
3. Cac de xuat hanh dong cu the
4. Canh bao neu co diem can chu y

Tra loi bang tieng Viet, chuyen nghiep, su dung danh sach va so lieu cu the.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI analyzeBusinessData error:', error.message);
    throw new Error('Dich vu AI tam thoi khong kha dung. Vui long thu lai sau.');
  }
};

module.exports = { suggestFood, analyzeBusinessData };
