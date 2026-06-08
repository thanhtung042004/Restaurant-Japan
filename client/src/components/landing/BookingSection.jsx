import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Calendar, Users, Clock, FileText } from 'lucide-react';
import { reservationAPI } from '../../api';

const TIME_OPTIONS = [
  '11:00', '11:30', '12:00', '12:30', '13:00',
  '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export default function BookingSection({ user, onOpenLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: name,
        phone,
        email,
        numberOfGuests: Number(guests),
        reservationDate: date,
        reservationTime: time,
        note
      };

      const res = await reservationAPI.create(payload);
      if (res.success) {
        setSuccessInfo(res.data);
        setBookingSuccess(true);
        toast.success('Đặt bàn thành công');
      }
    } catch (err) {
      toast.error(err.message || 'Không thể thực hiện đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start relative z-10">
        
        {/* Left Info Column */}
        <div className="flex flex-col">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-gold/60 reveal">
            Đặt Bàn
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide mb-6 reveal reveal-delay-1">
            Trải Nghiệm <br />
            <em className="font-serif font-light italic text-gold">Đang Chờ</em> Bạn
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-gold to-transparent mb-8 reveal reveal-delay-2" />
          <p className="text-sm text-cream-dim mb-6 leading-relaxed reveal reveal-delay-3">
            Đặt bàn trực tuyến để đảm bảo bạn có một buổi tối hoàn hảo tại Sakura.
            Chúng tôi khuyên bạn nên đặt bàn trước ít nhất 48 giờ để có được vị trí và
            thực đơn theo yêu cầu tốt nhất.
          </p>
          <p className="text-sm text-cream-dim mb-10 leading-relaxed reveal reveal-delay-4">
            Với các sự kiện đặc biệt — sinh nhật, kỷ niệm, hợp đồng kinh doanh —
            đội ngũ của chúng tôi sẽ chăm sóc đến từng chi tiết để buổi tối thêm ý nghĩa.
          </p>

          {/* Contact Details */}
          <div className="space-y-4 reveal reveal-delay-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold bg-gold/[0.02]">
                <Phone size={14} />
              </div>
              <span className="text-sm text-cream-dim font-light">+84 28 3838 8888</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold bg-gold/[0.02]">
                <Mail size={14} />
              </div>
              <span className="text-sm text-cream-dim font-light">reservation@sakura-japan.com</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold bg-gold/[0.02]">
                <MapPin size={14} />
              </div>
              <span className="text-sm text-cream-dim font-light">123 Nguyen Hue, Quan 1, TP.HCM</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="bg-glass border border-gold/20 p-8 sm:p-10 backdrop-blur-md relative overflow-hidden reveal">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          
          {bookingSuccess ? (
            <div className="text-center py-10">
              <div className="text-4xl text-gold mb-6 select-none font-serif">✦</div>
              <h3 className="font-serif text-2xl text-cream mb-4">Đặt Bàn Thành Công</h3>
              <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto mb-6">
                Chúng tôi đã ghi nhận thông tin của bạn. Mã đặt bàn hoặc thông tin đã được ghi nhận trong hệ thống.
              </p>
              {successInfo && successInfo.table && (
                <div className="inline-block px-4 py-2 border border-gold/20 bg-gold/[0.02] text-xs text-gold tracking-wider mb-6">
                  Bàn ăn dự kiến: {successInfo.table.tableNumber} ({successInfo.table.area})
                </div>
              )}
              <button 
                onClick={() => { setBookingSuccess(false); setSuccessInfo(null); }}
                className="text-xs text-gold border border-gold px-6 py-2 hover:bg-gold hover:text-bg transition-all"
              >
                Tạo Đặt Bàn Mới
              </button>
            </div>
          ) : !user ? (
            /* Locked screen for guest */
            <div className="text-center py-16 flex flex-col items-center">
              <div className="text-2xl text-gold font-serif mb-4 select-none">🔒</div>
              <h3 className="font-serif text-lg text-cream mb-3">Yêu Cầu Đăng Nhập</h3>
              <p className="text-xs text-muted max-w-xs mb-8 leading-relaxed">
                Vui lòng đăng nhập vào hệ thống để chúng tôi có thể lưu trữ thông tin đặt bàn và cập nhật trạng thái cho bạn.
              </p>
              <button 
                onClick={onOpenLogin}
                className="border border-gold text-gold px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-bg hover:shadow-[0_0_20px_rgba(201,164,71,0.2)] transition-all"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-serif text-xl text-cream tracking-wide mb-6">Tạo Đặt Bàn Mới</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Họ và Tên</label>
                  <input 
                    type="text" 
                    className="bg-bg/30 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                    placeholder="Nguyen Van A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Số Điện Thoại</label>
                  <input 
                    type="tel" 
                    className="bg-bg/30 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                    placeholder="0901 234 567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Email</label>
                <input 
                  type="email" 
                  className="bg-bg/30 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Ngày Đặt Bàn</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      min={minDate}
                      className="w-full bg-bg/30 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Giờ</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  >
                    <option value="">Chọn giờ</option>
                    {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Số Lượng Khách</label>
                <select 
                  className="bg-bg-2 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                >
                  <option value="1">1 người</option>
                  <option value="2">2 người</option>
                  <option value="3">3 người</option>
                  <option value="4">4 người</option>
                  <option value="5">5 người</option>
                  <option value="6">6 người</option>
                  <option value="8">7-10 người</option>
                  <option value="12">Trên 10 người</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Ghi Chú Đặc Biệt</label>
                <textarea 
                  className="bg-bg/30 border border-gold/10 text-cream px-4 py-2.5 text-xs outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-light"
                  rows={3}
                  placeholder="Dị ứng thực phẩm, dịp đặc biệt, yêu cầu chọn phòng VIP..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-transparent border border-gold text-gold py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-bg hover:shadow-[0_0_20px_rgba(201,164,71,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Bàn'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
