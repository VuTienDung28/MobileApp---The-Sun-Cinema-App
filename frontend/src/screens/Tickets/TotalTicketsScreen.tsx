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
const EMPTY_DATA = {
  totalTickets: 0,
  totalRevenue: 0,
  ticketsByMovie: [],
  ticketsByDay: [],
  recentTransactions: [],
};

const { width: screenWidth } = Dimensions.get('window');

const TotalTicketsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [ticketsData, setTicketsData] = useState(EMPTY_DATA);

  // 🔴 HÀM LẤY DỮ LIỆU THEO THỜI GIAN
  const fetchTicketStats = async (period: 'week' | 'month' | 'year') => {
    setIsLoading(true);
    
    try {
      // TODO: Gọi API lấy thống kê vé
      // const data = await ticketService.getTicketStats(period);
      // setTicketsData(data);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    } finally {
      setIsLoading(false);
    }
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
    labels: ticketsData.ticketsByDay.length > 0 ? ticketsData.ticketsByDay.map((item: any) => item.day) : [''],
    datasets: [
      {
        data: ticketsData.ticketsByDay.length > 0 ? ticketsData.ticketsByDay.map((item: any) => item.tickets) : [0],
        color: (opacity = 1) => `rgba(255, 204, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Số vé bán ra'],
  };

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = ticketsData.ticketsByMovie.map((movie: any) => ({
    name: movie.name.length > 15 ? movie.name.substring(0, 12) + '...' : movie.name,
    population: movie.tickets,
    color: movie.color || '#FFCC00',
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
          {ticketsData.ticketsByMovie.map((movie: any, index: number) => (
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
          {ticketsData.recentTransactions.map((transaction: any) => (
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