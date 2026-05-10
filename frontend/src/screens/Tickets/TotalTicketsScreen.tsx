import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { LineChart, PieChart } from 'react-native-chart-kit';

type Props = NativeStackScreenProps<RootStackParamList, 'TotalTickets'>;

// ============================================================
// 🔴 MOCK DATA - DỮ LIỆU GIẢ (TẠM THỜI)
// ============================================================

// 🔴 Dữ liệu theo TUẦN
const WEEK_DATA = {
  totalTickets: 28456,
  totalRevenue: 2134200000,
  ticketsByMovie: [
    { name: 'Avengers: Doomsday', tickets: 4821, color: '#FF6B6B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Lilo & Stitch', tickets: 3612, color: '#4ECDC4', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Mission: Impossible 8', tickets: 2974, color: '#A78BFA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Minecraft Movie', tickets: 2543, color: '#F59E0B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Snow White', tickets: 1897, color: '#60A5FA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'How to Train Your Dragon', tickets: 1654, color: '#F97316', legendFontColor: '#1A1A2E', legendFontSize: 12 },
  ],
  ticketsByDay: [
    { day: 'Mon', tickets: 3250 },
    { day: 'Tue', tickets: 2890 },
    { day: 'Wed', tickets: 3412 },
    { day: 'Thu', tickets: 3876 },
    { day: 'Fri', tickets: 5234 },
    { day: 'Sat', tickets: 6845 },
    { day: 'Sun', tickets: 5949 },
  ],
  recentTransactions: [
    { id: 1, movieName: 'Avengers: Doomsday', tickets: 3, total: 225000, date: '2024-01-15', user: 'Nguyễn Văn A' },
    { id: 2, movieName: 'Lilo & Stitch', tickets: 2, total: 150000, date: '2024-01-15', user: 'Trần Thị B' },
    { id: 3, movieName: 'Mission: Impossible 8', tickets: 4, total: 300000, date: '2024-01-14', user: 'Lê Văn C' },
    { id: 4, movieName: 'Avengers: Doomsday', tickets: 1, total: 75000, date: '2024-01-14', user: 'Phạm Thị D' },
    { id: 5, movieName: 'Minecraft Movie', tickets: 2, total: 150000, date: '2024-01-13', user: 'Hoàng Văn E' },
  ],
};

// 🔴 Dữ liệu theo THÁNG
const MONTH_DATA = {
  totalTickets: 125678,
  totalRevenue: 9425850000,
  ticketsByMovie: [
    { name: 'Avengers: Doomsday', tickets: 21500, color: '#FF6B6B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Lilo & Stitch', tickets: 16800, color: '#4ECDC4', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Mission: Impossible 8', tickets: 14200, color: '#A78BFA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Minecraft Movie', tickets: 12300, color: '#F59E0B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Snow White', tickets: 8900, color: '#60A5FA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'How to Train Your Dragon', tickets: 7600, color: '#F97316', legendFontColor: '#1A1A2E', legendFontSize: 12 },
  ],
  ticketsByDay: [
    { day: 'Tuần 1', tickets: 28500 },
    { day: 'Tuần 2', tickets: 31200 },
    { day: 'Tuần 3', tickets: 29800 },
    { day: 'Tuần 4', tickets: 36178 },
  ],
  recentTransactions: [
    { id: 1, movieName: 'Avengers: Doomsday', tickets: 45, total: 3375000, date: '2024-01-28', user: 'Nguyễn Văn A' },
    { id: 2, movieName: 'Lilo & Stitch', tickets: 38, total: 2850000, date: '2024-01-25', user: 'Trần Thị B' },
    { id: 3, movieName: 'Mission: Impossible 8', tickets: 52, total: 3900000, date: '2024-01-22', user: 'Lê Văn C' },
    { id: 4, movieName: 'Avengers: Doomsday', tickets: 29, total: 2175000, date: '2024-01-20', user: 'Phạm Thị D' },
    { id: 5, movieName: 'Minecraft Movie', tickets: 34, total: 2550000, date: '2024-01-18', user: 'Hoàng Văn E' },
  ],
};

// 🔴 Dữ liệu theo NĂM
const YEAR_DATA = {
  totalTickets: 1523456,
  totalRevenue: 114259200000,
  ticketsByMovie: [
    { name: 'Avengers: Doomsday', tickets: 285000, color: '#FF6B6B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Lilo & Stitch', tickets: 198000, color: '#4ECDC4', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Mission: Impossible 8', tickets: 175000, color: '#A78BFA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Minecraft Movie', tickets: 156000, color: '#F59E0B', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'Snow White', tickets: 125000, color: '#60A5FA', legendFontColor: '#1A1A2E', legendFontSize: 12 },
    { name: 'How to Train Your Dragon', tickets: 98000, color: '#F97316', legendFontColor: '#1A1A2E', legendFontSize: 12 },
  ],
  ticketsByDay: [
    { day: 'Tháng 1', tickets: 125678 },
    { day: 'Tháng 2', tickets: 142890 },
    { day: 'Tháng 3', tickets: 156789 },
    { day: 'Tháng 4', tickets: 148900 },
    { day: 'Tháng 5', tickets: 167890 },
    { day: 'Tháng 6', tickets: 178900 },
    { day: 'Tháng 7', tickets: 189000 },
    { day: 'Tháng 8', tickets: 175600 },
    { day: 'Tháng 9', tickets: 158900 },
    { day: 'Tháng 10', tickets: 145600 },
    { day: 'Tháng 11', tickets: 152300 },
    { day: 'Tháng 12', tickets: 205678 },
  ],
  recentTransactions: [
    { id: 1, movieName: 'Avengers: Doomsday', tickets: 1250, total: 93750000, date: '2024-12-25', user: 'Khách hàng VIP' },
    { id: 2, movieName: 'Lilo & Stitch', tickets: 980, total: 73500000, date: '2024-12-24', user: 'Khách hàng VIP' },
    { id: 3, movieName: 'Mission: Impossible 8', tickets: 1100, total: 82500000, date: '2024-12-23', user: 'Khách hàng VIP' },
    { id: 4, movieName: 'Avengers: Doomsday', tickets: 890, total: 66750000, date: '2024-12-22', user: 'Khách hàng VIP' },
    { id: 5, movieName: 'Minecraft Movie', tickets: 750, total: 56250000, date: '2024-12-21', user: 'Khách hàng VIP' },
  ],
};

const { width: screenWidth } = Dimensions.get('window');

const TotalTicketsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [ticketsData, setTicketsData] = useState(WEEK_DATA);

  // 🔴 HÀM LẤY DỮ LIỆU THEO THỜI GIAN
  const fetchTicketStats = (period: 'week' | 'month' | 'year') => {
    setIsLoading(true);
    
    // Giả lập loading
    setTimeout(() => {
      if (period === 'week') {
        setTicketsData(WEEK_DATA);
      } else if (period === 'month') {
        setTicketsData(MONTH_DATA);
      } else {
        setTicketsData(YEAR_DATA);
      }
      setIsLoading(false);
    }, 500);
  };

  // 🔴 KHI CHỌN PERIOD, TỰ ĐỘNG CẬP NHẬT DỮ LIỆU
  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    fetchTicketStats(period);
  };

  // Format functions
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  // Dữ liệu cho biểu đồ đường
  const lineChartData = {
    labels: ticketsData.ticketsByDay.map(item => item.day),
    datasets: [
      {
        data: ticketsData.ticketsByDay.map(item => item.tickets),
        color: (opacity = 1) => `rgba(255, 204, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Số vé bán ra'],
  };

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = ticketsData.ticketsByMovie.map(movie => ({
    name: movie.name.length > 15 ? movie.name.substring(0, 12) + '...' : movie.name,
    population: movie.tickets,
    color: movie.color,
    legendFontColor: '#1A1A2E',
    legendFontSize: 11,
  }));

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardLeft}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống Kê Vé</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchTicketStats(selectedPeriod)}>
          <Ionicons name="refresh-outline" size={22} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🔴 Period Selector - ĐÃ SỬA: Khi bấm sẽ thay đổi dữ liệu */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]} 
            onPress={() => handlePeriodChange('week')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>Tuần</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]} 
            onPress={() => handlePeriodChange('month')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>Tháng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]} 
            onPress={() => handlePeriodChange('year')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextActive]}>Năm</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards - HIỂN THỊ DỮ LIỆU ĐÃ CẬP NHẬT */}
        <View style={styles.statsRow}>
          <StatCard 
            title="Tổng vé đã bán"
            value={formatNumber(ticketsData.totalTickets)}
            icon="ticket-outline"
            color="#FFCC00"
          />
          <StatCard 
            title="Tổng doanh thu"
            value={formatCurrency(ticketsData.totalRevenue)}
            icon="cash-outline"
            color="#4ECDC4"
          />
        </View>

        {/* Line Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {selectedPeriod === 'week' && '📈 Xu hướng bán vé theo ngày'}
            {selectedPeriod === 'month' && '📈 Xu hướng bán vé theo tuần'}
            {selectedPeriod === 'year' && '📈 Xu hướng bán vé theo tháng'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={lineChartData}
              width={Math.max(screenWidth - 40, lineChartData.labels.length * 70)}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 204, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(26, 26, 46, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#FFCC00' },
              }}
              bezier
              style={styles.chart}
              formatYLabel={(value) => formatNumber(parseInt(value))}
            />
          </ScrollView>
        </View>

        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🥧 Phân bố vé theo phim</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Top Movies Table */}
        <View style={styles.tableCard}>
          <Text style={styles.chartTitle}>🎬 Top phim bán chạy</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellRank]}>#</Text>
            <Text style={[styles.tableCell, styles.tableCellName]}>Tên phim</Text>
            <Text style={[styles.tableCell, styles.tableCellTickets]}>Vé đã bán</Text>
            <Text style={[styles.tableCell, styles.tableCellRevenue]}>Doanh thu</Text>
          </View>
          {ticketsData.ticketsByMovie.map((movie, index) => (
            <View key={movie.name} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellRank, styles.rankNumber]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.tableCellName]} numberOfLines={1}>{movie.name}</Text>
              <Text style={[styles.tableCell, styles.tableCellTickets]}>{formatNumber(movie.tickets)}</Text>
              <Text style={[styles.tableCell, styles.tableCellRevenue]}>
                {formatCurrency(movie.tickets * 75000)}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.tableCard}>
          <Text style={styles.chartTitle}>🕐 Giao dịch gần đây</Text>
          <View style={styles.transactionHeader}>
            <Text style={[styles.transactionCell, styles.transactionCellDate]}>Ngày</Text>
            <Text style={[styles.transactionCell, styles.transactionCellMovie]}>Phim</Text>
            <Text style={[styles.transactionCell, styles.transactionCellTickets]}>Vé</Text>
            <Text style={[styles.transactionCell, styles.transactionCellAmount]}>Tổng</Text>
          </View>
          {ticketsData.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionRow}>
              <Text style={[styles.transactionCell, styles.transactionCellDate]}>{transaction.date.split('-')[2]}/{transaction.date.split('-')[1]}</Text>
              <Text style={[styles.transactionCell, styles.transactionCellMovie]} numberOfLines={1}>{transaction.movieName}</Text>
              <Text style={[styles.transactionCell, styles.transactionCellTickets]}>{transaction.tickets}</Text>
              <Text style={[styles.transactionCell, styles.transactionCellAmount]}>{formatCurrency(transaction.total)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 12 : 20, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#FFE5B4' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFCC00' },
  refreshButton: { padding: 8 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  periodSelector: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 4, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  periodButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  periodButtonActive: { backgroundColor: '#FFCC00' },
  periodText: { fontSize: 14, fontWeight: '600', color: '#8A7851' },
  periodTextActive: { color: '#1A1A2E' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  statTitle: { fontSize: 12, color: '#8A7851', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  chartCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#8A7851', marginBottom: 16 },
  chart: { marginLeft: -25, borderRadius: 16 },
  tableCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tableHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#FFE5B4', marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFF0D4' },
  tableCell: { fontSize: 13, color: '#1A1A2E' },
  tableCellRank: { width: 35, fontWeight: '700' },
  tableCellName: { flex: 2 },
  tableCellTickets: { width: 70, textAlign: 'right' },
  tableCellRevenue: { width: 90, textAlign: 'right' },
  rankNumber: { fontWeight: '700', color: '#FFCC00' },
  transactionHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#FFE5B4', marginBottom: 8 },
  transactionRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFF0D4' },
  transactionCell: { fontSize: 12, color: '#1A1A2E' },
  transactionCellDate: { width: 45 },
  transactionCellMovie: { flex: 2 },
  transactionCellTickets: { width: 35, textAlign: 'center' },
  transactionCellAmount: { width: 85, textAlign: 'right' },
});

export default TotalTicketsScreen;