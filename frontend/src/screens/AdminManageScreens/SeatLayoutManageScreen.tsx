import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
} from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import seatService, { RoomSeatLayoutDto, SeatDto, SeatRowConfigDto } from '../../services/seatService';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatLayoutManage'>;

type BuilderStep = 'NONE' | 'INIT_CONFIG' | 'INTERACTIVE_GRID' | 'ROW_CONFIG';

type BuilderTool = 'ToggleSeat' | 'PaintStandard' | 'PaintVIP' | 'PaintCouple' | 'EditRowName';

interface InteractiveRowConfig {
  name: string;
  type: string;
  hiddenCols: Set<number>;
}

const SeatLayoutManageScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cinemaId, roomId, roomName } = route.params;

  const [layout, setLayout] = useState<RoomSeatLayoutDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // BUILDER STATES
  // ==========================================
  const [builderStep, setBuilderStep] = useState<BuilderStep>('NONE');
  const [activeTool, setActiveTool] = useState<BuilderTool>('ToggleSeat');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const zoomableViewRef = React.useRef<any>(null);

  // Step 1: Initial Grid Size
  const [initRows, setInitRows] = useState('10');
  const [initCols, setInitCols] = useState('15');
  const [isNumberingFromRight, setIsNumberingFromRight] = useState(false);

  // Step 2: Interactive Grid Config
  const [aisleCols, setAisleCols] = useState<Set<number>>(new Set());
  const [rowConfigs, setRowConfigs] = useState<InteractiveRowConfig[]>([]);

  // Step 3: Row Config Edit
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [tempRowName, setTempRowName] = useState('');
  const [tempRowType, setTempRowType] = useState('Standard');

  // ==========================================
  // API CALLS
  // ==========================================
  const fetchLayout = async () => {
    try {
      setIsLoading(true);
      const data = await seatService.getSeatLayout(cinemaId, roomId);
      setLayout(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setLayout(null);
      } else {
        console.error('Error fetching seat layout:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [cinemaId, roomId]);

  const handleClearSeats = () => {
    useAlertStore.getState().showAlert(
      'Xóa Sơ Đồ Ghế',
      'Bạn có chắc muốn xóa toàn bộ sơ đồ ghế của phòng này?',
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Xóa ngay', 
            onPress: async () => {
              try {
                await seatService.clearSeats(cinemaId, roomId);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa sơ đồ ghế!', { type: 'success' });
                fetchLayout();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa ghế', { type: 'error' });
              }
            }
          }
        ]
      }
    );
  };

  // ==========================================
  // BUILDER LOGIC
  // ==========================================
  const startBuilder = () => {
    setBuilderStep('INIT_CONFIG');
  };

  const startEditBuilder = () => {
    if (!layout || layout.seats.length === 0) return;

    const cols = layout.totalColumns;
    setInitCols(cols.toString());

    const rowNames = Array.from(new Set(layout.seats.map(s => s.rowName)));
    setInitRows(rowNames.length.toString());

    let isFromRight = false;
    for (const rn of rowNames) {
      const seatsInRow = layout.seats.filter(s => s.rowName === rn).sort((a, b) => a.columnIndex - b.columnIndex);
      if (seatsInRow.length >= 2) {
        if (seatsInRow[0].seatNumber > seatsInRow[seatsInRow.length - 1].seatNumber) {
          isFromRight = true;
        }
        break;
      }
    }
    setIsNumberingFromRight(isFromRight);

    const occupiedCols = new Set<number>();
    layout.seats.forEach(s => {
      occupiedCols.add(s.columnIndex);
      if (s.type === 'Couple') occupiedCols.add(s.columnIndex + 1);
    });

    const newAisles = new Set<number>();
    for (let c = 1; c <= cols; c++) {
      if (!occupiedCols.has(c)) newAisles.add(c - 1);
    }
    setAisleCols(newAisles);

    const newRowConfigs: InteractiveRowConfig[] = rowNames.map(rn => {
      const seatsInRow = layout.seats.filter(s => s.rowName === rn);
      const rowType = seatsInRow.length > 0 ? seatsInRow[0].type : 'Standard';
      
      const hidden = new Set<number>();
      const occupiedInThisRow = new Set<number>();
      seatsInRow.forEach(s => {
        occupiedInThisRow.add(s.columnIndex);
        if (s.type === 'Couple') occupiedInThisRow.add(s.columnIndex + 1);
      });

      for (let c = 1; c <= cols; c++) {
        if (!occupiedInThisRow.has(c) && !newAisles.has(c - 1)) {
          hidden.add(c - 1);
        }
      }

      return {
        name: rn,
        type: rowType,
        hiddenCols: hidden
      };
    });

    setRowConfigs(newRowConfigs);
    setBuilderStep('INTERACTIVE_GRID');
  };

  const confirmInitConfig = () => {
    const rows = parseInt(initRows);
    const cols = parseInt(initCols);
    if (isNaN(rows) || rows <= 0 || isNaN(cols) || cols <= 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Số hàng và cột phải là số dương hợp lệ.', { type: 'error' });
      return;
    }

    // Tạo config mặc định cho các hàng
    const newConfigs: InteractiveRowConfig[] = [];
    for (let i = 0; i < rows; i++) {
      newConfigs.push({
        name: String.fromCharCode(65 + i), // A, B, C...
        type: 'Standard',
        hiddenCols: new Set(),
      });
    }

    setRowConfigs(newConfigs);
    setAisleCols(new Set());
    setBuilderStep('INTERACTIVE_GRID');
  };

  const toggleAisle = (colIndex: number) => {
    const newAisles = new Set(aisleCols);
    if (newAisles.has(colIndex)) {
      newAisles.delete(colIndex);
    } else {
      newAisles.add(colIndex);
    }
    setAisleCols(newAisles);
  };

  // ==========================================
  // DRAG-TO-PAINT LOGIC
  // ==========================================
  const stateRef = React.useRef({ activeTool, rowConfigs, initRows, initCols, aisleCols });
  useEffect(() => {
    stateRef.current = { activeTool, rowConfigs, initRows, initCols, aisleCols };
  }, [activeTool, rowConfigs, initRows, initCols, aisleCols]);

  const paintIntent = React.useRef<'hide' | 'show' | null>(null);
  const lastPaintedCell = React.useRef<{ r: number; c: number } | null>(null);

  const getCellFromTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const x = locationX - 48; // offset of row headers
    const y = locationY;
    if (x < 0 || y < 0) return null;
    return { r: Math.floor(y / 38), c: Math.floor(x / 38) };
  };

  const processDragPaint = (evt: GestureResponderEvent, isStart: boolean) => {
    const cell = getCellFromTouch(evt);
    if (!cell) return;
    const { r, c } = cell;
    const { activeTool: currentTool, rowConfigs: currentConfigs, initRows: currentRows, initCols: currentCols, aisleCols: currentAisles } = stateRef.current;
    
    if (r < 0 || r >= parseInt(currentRows) || c < 0 || c >= parseInt(currentCols)) return;
    if (!isStart && lastPaintedCell.current?.r === r && lastPaintedCell.current?.c === c) return;
    lastPaintedCell.current = { r, c };

    if (currentTool === 'ToggleSeat') {
      if (currentAisles.has(c)) return;
      if (isStart) {
        paintIntent.current = currentConfigs[r].hiddenCols.has(c) ? 'show' : 'hide';
      }
      setRowConfigs(prev => {
        const newConfigs = [...prev];
        const hiddenSet = new Set(newConfigs[r].hiddenCols);
        if (paintIntent.current === 'hide') hiddenSet.add(c);
        else hiddenSet.delete(c);
        newConfigs[r] = { ...newConfigs[r], hiddenCols: hiddenSet };
        return newConfigs;
      });
    } else if (currentTool.startsWith('Paint')) {
      const type = currentTool.replace('Paint', '');
      setRowConfigs(prev => {
        const newConfigs = [...prev];
        if (newConfigs[r].type !== type) {
          newConfigs[r] = { ...newConfigs[r], type };
        }
        return newConfigs;
      });
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const tool = stateRef.current.activeTool;
        return tool !== 'EditRowName';
      },
      onMoveShouldSetPanResponder: () => {
        const tool = stateRef.current.activeTool;
        return tool !== 'EditRowName';
      },
      onPanResponderGrant: (evt) => processDragPaint(evt, true),
      onPanResponderMove: (evt) => processDragPaint(evt, false),
      onPanResponderRelease: () => { lastPaintedCell.current = null; },
      onPanResponderTerminate: () => { lastPaintedCell.current = null; },
    })
  ).current;

  // Fallback for tap when PanResponder is not active (EditRowName tool)
  const handleCellTap = (rowIndex: number, colIndex: number) => {
    if (activeTool === 'EditRowName') openRowConfig(rowIndex);
  };

  const applyTypeToRow = (rowIndex: number, type: string) => {
    const newConfigs = [...rowConfigs];
    newConfigs[rowIndex].type = type;
    setRowConfigs(newConfigs);
  };

  const openRowConfig = (rowIndex: number) => {
    if (activeTool === 'PaintStandard') applyTypeToRow(rowIndex, 'Standard');
    else if (activeTool === 'PaintVIP') applyTypeToRow(rowIndex, 'VIP');
    else if (activeTool === 'PaintCouple') applyTypeToRow(rowIndex, 'Couple');
    else {
      // EditRowName or ToggleSeat tools -> Open modal for Name change
      setActiveRowIndex(rowIndex);
      setTempRowName(rowConfigs[rowIndex].name);
      setTempRowType(rowConfigs[rowIndex].type);
      setBuilderStep('ROW_CONFIG');
    }
  };

  const saveRowConfig = () => {
    if (activeRowIndex === null || !tempRowName.trim()) return;
    
    const newConfigs = [...rowConfigs];
    newConfigs[activeRowIndex].name = tempRowName.trim();
    newConfigs[activeRowIndex].type = tempRowType;
    setRowConfigs(newConfigs);
    
    setBuilderStep('INTERACTIVE_GRID');
    setActiveRowIndex(null);
  };

  const submitGenerateSeats = async () => {
    // Chuyển state sang DTO
    const cols = parseInt(initCols);
    
    try {
      await seatService.generateSeats(cinemaId, roomId, {
        totalColumns: cols,
        aisleAtColumns: Array.from(aisleCols).map(c => c + 1), // Backend 1-indexed
        isNumberingFromRight: isNumberingFromRight,
        rows: rowConfigs.map(r => ({
          rowName: r.name,
          type: r.type,
          hiddenColumns: Array.from(r.hiddenCols).map(c => c + 1) // Backend 1-indexed
        }))
      });
      useAlertStore.getState().showAlert('Thành công', 'Tạo sơ đồ ghế thành công!', { type: 'success' });
      setBuilderStep('NONE');
      fetchLayout();
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi tạo ghế', { type: 'error' });
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const renderInitConfigModal = () => (
    <Modal visible={builderStep === 'INIT_CONFIG'} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Khởi tạo kích thước Lưới</Text>
          
          <Text style={styles.inputLabel}>Số hàng tối đa (Ví dụ: 10)</Text>
          <TextInput style={styles.input} value={initRows} onChangeText={setInitRows} keyboardType="numeric" />

          <Text style={styles.inputLabel}>Tổng số cột (bao gồm lối đi)</Text>
          <TextInput style={styles.input} value={initCols} onChangeText={setInitCols} keyboardType="numeric" />

          <View style={styles.directionToggleContainer}>
            <Text style={styles.inputLabel}>Chiều đánh số ghế</Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity 
                style={[styles.toggleBtn, !isNumberingFromRight && styles.toggleBtnActive]}
                onPress={() => setIsNumberingFromRight(false)}
              >
                <Text style={[styles.toggleBtnText, !isNumberingFromRight && styles.toggleBtnTextActive]}>Trái sang Phải</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, isNumberingFromRight && styles.toggleBtnActive]}
                onPress={() => setIsNumberingFromRight(true)}
              >
                <Text style={[styles.toggleBtnText, isNumberingFromRight && styles.toggleBtnTextActive]}>Phải sang Trái</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBuilderStep('NONE')}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmInitConfig}>
              <Text style={styles.confirmText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRowConfigModal = () => (
    <Modal visible={builderStep === 'ROW_CONFIG'} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chỉnh sửa Hàng ghế</Text>
          
          <Text style={styles.inputLabel}>Tên hàng</Text>
          <TextInput style={styles.input} value={tempRowName} onChangeText={setTempRowName} maxLength={5} />

          <Text style={styles.inputLabel}>Loại ghế (áp dụng cả hàng)</Text>
          <View style={styles.typeSelectorRow}>
            {['Standard', 'VIP', 'Couple'].map(type => (
              <TouchableOpacity 
                key={type}
                style={[styles.typeOption, tempRowType === type && styles.typeOptionActive]}
                onPress={() => setTempRowType(type)}
              >
                <Text style={[styles.typeOptionText, tempRowType === type && styles.typeOptionTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBuilderStep('INTERACTIVE_GRID')}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={saveRowConfig}>
              <Text style={styles.confirmText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderInteractiveGrid = () => {
    if (builderStep !== 'INTERACTIVE_GRID') return null;
    const colsCount = parseInt(initCols) || 0;

    return (
      <Modal visible={true} animationType="slide">
        <SafeAreaView style={styles.builderContainer}>
          <View style={styles.builderHeader}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setBuilderStep('INIT_CONFIG')}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
              <Text style={styles.builderTitle} numberOfLines={1}>Interactive Map Builder</Text>
              <Text style={styles.builderSubTitle} numberOfLines={1}>Chạm cột tạo Lối đi. Chạm hàng để chỉnh sửa.</Text>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={submitGenerateSeats}>
              <Text style={styles.saveBtnText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.builderToolbar}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center' }}>
               
               {/* Zoom Controls */}
               <View style={styles.zoomControls}>
                 <TouchableOpacity onPress={() => zoomableViewRef.current?.zoomBy(-0.2)} style={styles.zoomBtn}>
                   <Ionicons name="remove" size={16} color="#1A1A2E" />
                 </TouchableOpacity>
                 <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
                 <TouchableOpacity onPress={() => zoomableViewRef.current?.zoomBy(0.2)} style={styles.zoomBtn}>
                   <Ionicons name="add" size={16} color="#1A1A2E" />
                 </TouchableOpacity>
               </View>
               <View style={styles.toolbarDivider} />

               <TouchableOpacity 
                 style={[styles.toolBtn, activeTool === 'ToggleSeat' && styles.toolBtnActive]} 
                 onPress={() => setActiveTool('ToggleSeat')}
               >
                 <Ionicons name="scan" size={16} color={activeTool === 'ToggleSeat' ? '#1A1A2E' : '#BDBDBD'} />
                 <Text style={[styles.toolBtnText, activeTool === 'ToggleSeat' && styles.toolBtnTextActive]}>Ẩn/Hiện Ghế</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.toolBtn, activeTool === 'PaintStandard' && styles.toolBtnActive]} 
                 onPress={() => setActiveTool('PaintStandard')}
               >
                 <View style={[styles.toolColorDot, { backgroundColor: '#BDBDBD' }]} />
                 <Text style={[styles.toolBtnText, activeTool === 'PaintStandard' && styles.toolBtnTextActive]}>Tô Standard</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.toolBtn, activeTool === 'PaintVIP' && styles.toolBtnActive]} 
                 onPress={() => setActiveTool('PaintVIP')}
               >
                 <View style={[styles.toolColorDot, { backgroundColor: '#FFCC00' }]} />
                 <Text style={[styles.toolBtnText, activeTool === 'PaintVIP' && styles.toolBtnTextActive]}>Tô VIP</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.toolBtn, activeTool === 'PaintCouple' && styles.toolBtnActive]} 
                 onPress={() => setActiveTool('PaintCouple')}
               >
                 <View style={[styles.toolColorDot, { backgroundColor: '#9B59B6' }]} />
                 <Text style={[styles.toolBtnText, activeTool === 'PaintCouple' && styles.toolBtnTextActive]}>Tô Couple</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.toolBtn, activeTool === 'EditRowName' && styles.toolBtnActive]} 
                 onPress={() => setActiveTool('EditRowName')}
               >
                 <Ionicons name="text" size={16} color={activeTool === 'EditRowName' ? '#1A1A2E' : '#BDBDBD'} />
                 <Text style={[styles.toolBtnText, activeTool === 'EditRowName' && styles.toolBtnTextActive]}>Đổi Tên Hàng</Text>
               </TouchableOpacity>

               <View style={styles.toolbarDivider} />

               <TouchableOpacity 
                 style={[styles.toolBtn, isNumberingFromRight && styles.toolBtnActive]} 
                 onPress={() => setIsNumberingFromRight(!isNumberingFromRight)}
               >
                 <Ionicons name="swap-horizontal" size={16} color={isNumberingFromRight ? '#1A1A2E' : '#BDBDBD'} />
                 <Text style={[styles.toolBtnText, isNumberingFromRight && styles.toolBtnTextActive]}>
                   {isNumberingFromRight ? 'Phải -> Trái' : 'Trái -> Phải'}
                 </Text>
               </TouchableOpacity>
             </ScrollView>
          </View>

          <View style={styles.builderWorkspace}>
            <ReactNativeZoomableView
              ref={zoomableViewRef}
              maxZoom={3}
              minZoom={0.5}
              zoomStep={0.2}
              initialZoom={1}
              bindToBorders={false}
              onZoomAfter={(e, gs, zEvent) => setZoomLevel(zEvent.zoomLevel)}
              panEnabled={true}
            >
              <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                <View>
                  {/* Column Headers for Aisles */}
                  <View style={{ flexDirection: 'row', marginLeft: 44, marginBottom: 12 }}>
                    {Array.from({ length: colsCount }).map((_, c) => (
                      <TouchableOpacity 
                        key={c} 
                        style={[styles.colHeaderBtn, aisleCols.has(c) && styles.colHeaderBtnActive]}
                        onPress={() => toggleAisle(c)}
                      >
                        <Ionicons name={aisleCols.has(c) ? "walk" : "chevron-down"} size={14} color={aisleCols.has(c) ? "#FFCC00" : "#8A7851"} />
                        <Text style={[styles.colHeaderText, aisleCols.has(c) && {color: '#FFCC00'}]}>{c + 1}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Rows Grid Wrapper for PanResponder */}
                  <View {...panResponder.panHandlers} style={{ backgroundColor: 'transparent' }} collapsable={false}>
                    {rowConfigs.map((rc, r) => (
                      <View key={r} style={styles.builderRow} pointerEvents={activeTool === 'EditRowName' ? 'auto' : 'none'}>
                        <TouchableOpacity style={styles.rowHeaderBtn} onPress={() => openRowConfig(r)}>
                          <Text style={styles.rowHeaderText} numberOfLines={1}>{rc.name}</Text>
                          <Text style={{ fontSize: 8, color: '#A0A0A0' }}>
                            {rc.type === 'Standard' ? 'STD' : rc.type === 'Couple' ? 'CPL' : 'VIP'}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.rowCells}>
                          {(() => {
                            const validCellsInRow: number[] = [];
                            for (let c = 0; c < colsCount; c++) {
                               if (!aisleCols.has(c) && !rc.hiddenCols.has(c)) {
                                   validCellsInRow.push(c);
                               }
                            }

                            return Array.from({ length: colsCount }).map((_, c) => {
                              const isAisle = aisleCols.has(c);
                              const isHidden = rc.hiddenCols.has(c);
                              
                              let seatDisplay = "";
                              let isCoupleLeft = false;
                              let isCoupleRight = false;

                              if (!isAisle && !isHidden) {
                                 const validIndex = validCellsInRow.indexOf(c);
                                 
                                 if (rc.type === 'Couple') {
                                    if (validIndex % 2 === 0) {
                                       if (validIndex + 1 < validCellsInRow.length && validCellsInRow[validIndex + 1] === c + 1) {
                                          isCoupleLeft = true;
                                       }
                                    } else {
                                       if (validCellsInRow[validIndex - 1] === c - 1) {
                                          isCoupleRight = true;
                                       }
                                    }

                                    // Calc couple display name
                                    if (isCoupleLeft || isCoupleRight) {
                                        let coupleGroupIndex = Math.floor(validIndex / 2);
                                        let totalCoupleGroups = Math.floor(validCellsInRow.length / 2);
                                        let seatNum = isNumberingFromRight ? (totalCoupleGroups - coupleGroupIndex) : (coupleGroupIndex + 1);
                                        
                                        if (isCoupleLeft) {
                                            seatDisplay = `${rc.name}${seatNum * 2 - 1}`;
                                        } else {
                                            seatDisplay = `${rc.name}${seatNum * 2}`;
                                        }
                                        
                                        // If numbering from right, the physical left square gets the higher number (the right-side number)
                                        if (isNumberingFromRight) {
                                            if (isCoupleLeft) {
                                                seatDisplay = `${rc.name}${seatNum * 2}`;
                                            } else {
                                                seatDisplay = `${rc.name}${seatNum * 2 - 1}`;
                                            }
                                        }
                                    }
                                 } else {
                                     let seatNum = isNumberingFromRight ? (validCellsInRow.length - validIndex) : (validIndex + 1);
                                     seatDisplay = `${rc.name}${seatNum}`;
                                 }
                              }
                              
                              let cellStyle: any = styles.cellStandard;
                              if (isAisle) cellStyle = styles.cellAisle;
                              else if (isHidden) cellStyle = styles.cellHidden;
                              else if (rc.type === 'VIP') cellStyle = styles.cellVIP;
                              else if (rc.type === 'Couple') {
                                 if (isCoupleLeft) {
                                   cellStyle = [styles.cellCouple, { width: 36, marginRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }];
                                 } else if (isCoupleRight) {
                                   cellStyle = [styles.cellCouple, { width: 36, marginLeft: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }];
                                 } else {
                                   cellStyle = styles.cellCouple;
                                 }
                              }

                              return (
                                <TouchableOpacity 
                                  key={c}
                                  activeOpacity={0.7}
                                  onPress={() => handleCellTap(r, c)}
                                  style={[styles.builderCell, cellStyle]}
                                >
                                  {!isAisle && !isHidden && !isCoupleLeft && !isCoupleRight && (
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: 'rgba(0,0,0,0.6)' }} adjustsFontSizeToFit numberOfLines={1}>
                                      {seatDisplay}
                                    </Text>
                                  )}
                                  {isCoupleLeft && (
                                    <View style={{ width: '100%', alignItems: 'flex-end', paddingRight: 2 }}>
                                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }} adjustsFontSizeToFit numberOfLines={1}>
                                        {seatDisplay}
                                      </Text>
                                    </View>
                                  )}
                                  {isCoupleRight && (
                                    <View style={{ width: '100%', alignItems: 'flex-start', paddingLeft: 2 }}>
                                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }} adjustsFontSizeToFit numberOfLines={1}>
                                        {seatDisplay}
                                      </Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            });
                          })()}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ReactNativeZoomableView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // ==========================================
  // RENDER MAIN SCREEN
  // ==========================================
  const getSeatDisplayName = (seat: SeatDto) => {
    if (!seat) return "";
    if (seat.type === 'Couple') {
      return `${seat.rowName}${seat.seatNumber * 2 - 1}  ${seat.rowName}${seat.seatNumber * 2}`;
    }
    return `${seat.rowName}${seat.seatNumber}`;
  };

  const numRows = layout ? Array.from(new Set(layout.seats.map(s => s.rowName))).length : 10;
  const numCols = layout?.totalColumns || 10;
  const contentWidth = numCols * 36 + 60;
  const contentHeight = numRows * 38 + 120; // Screen box + Seats

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{roomName} - Sơ đồ ghế</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {!layout || layout.seats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có sơ đồ ghế</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={startBuilder}>
              <Ionicons name="add" size={20} color="#1A1A2E" />
              <Text style={styles.generateBtnText}>Mở trình tạo Sơ đồ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.layoutContainer}>
            <View style={{ height: 450, width: '100%', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12, marginBottom: 20 }}>
              <ReactNativeZoomableView
                maxZoom={2.5}
                minZoom={Math.min(1, Dimensions.get('window').width / contentWidth)}
                zoomStep={0.5}
                initialZoom={Math.min(1, Dimensions.get('window').width / contentWidth)}
                bindToBorders={true}
                contentWidth={contentWidth}
                contentHeight={contentHeight}
                style={{ flex: 1 }}
              >
                <View style={{ width: contentWidth, height: contentHeight, alignItems: 'center', alignSelf: 'center', paddingTop: 20 }}>
                  <View style={styles.screenIndicator}>
                    <Text style={styles.screenText}>MÀN HÌNH</Text>
                  </View>

                  <View style={styles.seatGrid}>
                    {Array.from(new Set(layout.seats.map(s => s.rowName))).map((rowName) => (
                      <View key={rowName} style={styles.seatRow}>
                        <Text style={styles.rowLabel}>{rowName}</Text>
                        <View style={styles.rowSeats}>
                          {(() => {
                            const renderedRow = [];
                            let skipNext = false;
                            for (let colIdx = 0; colIdx < layout.totalColumns; colIdx++) {
                              if (skipNext) {
                                skipNext = false;
                                continue;
                              }
                              const seat = layout.seats.find(s => s.rowName === rowName && s.columnIndex === colIdx + 1);
                              if (!seat) {
                                renderedRow.push(<View key={colIdx} style={styles.emptySeat} />);
                              } else {
                                if (seat.type === 'Couple') skipNext = true; 
                                renderedRow.push(
                                  <View key={colIdx} style={[
                                    styles.seat, 
                                    seat.type === 'VIP' ? styles.seatVIP : styles.seatStandard,
                                    seat.type === 'Couple' ? styles.seatCoupleScreen : null
                                  ]}>
                                    <Text style={styles.seatNumber}>{getSeatDisplayName(seat)}</Text>
                                  </View>
                                );
                              }
                            }
                            return renderedRow;
                          })()}
                        </View>
                        <Text style={styles.rowLabel}>{rowName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ReactNativeZoomableView>
            </View>

            <View style={styles.mainLegendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendBox, styles.seatStandard]} /><Text style={styles.mainLegendText}>Standard</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, styles.seatVIP]} /><Text style={styles.mainLegendText}>VIP</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, styles.seatCoupleScreen, { width: 30 }]} /><Text style={styles.mainLegendText}>Couple</Text></View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.editBtn} onPress={startEditBuilder}>
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.clearBtnText}>Sửa sơ đồ hiện tại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearSeats}>
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={styles.clearBtnText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {renderInitConfigModal()}
      {renderRowConfigModal()}
      {renderInteractiveGrid()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 12 : 20, paddingBottom: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#FFE5B4',
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFCC00', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  
  // Empty State
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#8A7851', marginTop: 16, marginBottom: 24 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFCC00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8 },
  generateBtnText: { color: '#1A1A2E', fontWeight: '700', fontSize: 16 },

  // Display Layout
  layoutContainer: { alignItems: 'center', paddingBottom: 40 },
  screenIndicator: { width: '80%', height: 30, backgroundColor: '#4ECDC4', borderBottomLeftRadius: 50, borderBottomRightRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  screenText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 2 },
  seatGrid: { alignItems: 'center' },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowLabel: { width: 20, textAlign: 'center', fontWeight: 'bold', color: '#8A7851' },
  rowSeats: { flexDirection: 'row', marginHorizontal: 10 },
  seat: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', marginHorizontal: 3, borderRadius: 4, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", overflow: "hidden" },
  seatStandard: { backgroundColor: '#BDBDBD' },
  seatVIP: { backgroundColor: '#FFCC00' },
  seatCoupleScreen: { width: 66, backgroundColor: '#9B59B6' },
  emptySeat: { width: 30, height: 30, marginHorizontal: 3 },
  seatNumber: { fontSize: 9, fontWeight: 'bold', color: '#111' },
  mainLegendContainer: { flexDirection: 'row', marginTop: 10, gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mainLegendText: { fontSize: 12, color: '#8A7851', fontWeight: '600' },
  legendBox: { width: 20, height: 20, borderRadius: 4 },
  actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 40 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4ECDC4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  clearBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // Modals Shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, color: '#8A7851', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#FFE5B4', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20, color: '#1A1A2E', fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#4B5563' },
  confirmBtn: { flex: 1, padding: 14, backgroundColor: '#FFCC00', borderRadius: 12, alignItems: 'center' },
  confirmText: { fontWeight: '700', color: '#1A1A2E' },

  // Toggle Dir
  directionToggleContainer: { marginBottom: 20 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  toggleBtnText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  toggleBtnTextActive: { color: '#FFCC00', fontWeight: '700' },

  // Type Selector Row Config
  typeSelectorRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  typeOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#FFE5B4', backgroundColor: '#FAFAFA' },
  typeOptionActive: { backgroundColor: '#FFCC00', borderColor: '#FFCC00' },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: '#8A7851' },
  typeOptionTextActive: { color: '#1A1A2E' },

  // Interactive Builder Fullscreen
  builderContainer: { flex: 1, backgroundColor: '#2A2A3A' }, // Dark theme for builder canvas
  builderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A2E', borderBottomWidth: 1, borderBottomColor: '#3A3A4A' },
  headerBtn: { padding: 8 },
  builderTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  builderSubTitle: { color: '#A0A0A0', fontSize: 11, textAlign: 'center', marginTop: 2 },
  saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexShrink: 0 },
  saveBtnText: { color: '#1A1A2E', fontWeight: '700', fontSize: 14 },
  
  builderToolbar: { paddingVertical: 12, backgroundColor: '#1A1A2E', borderBottomWidth: 1, borderBottomColor: '#3A3A4A' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3A3A4A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  toolBtnActive: { backgroundColor: '#FFCC00' },
  toolBtnText: { color: '#E0E0E0', fontSize: 12, fontWeight: '600' },
  toolBtnTextActive: { color: '#1A1A2E' },
  toolColorDot: { width: 12, height: 12, borderRadius: 6 },

  builderWorkspace: { flex: 1, backgroundColor: '#2A2A3A', overflow: 'hidden' },
  
  zoomControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFCC00', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4, gap: 8 },
  zoomBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 12 },
  zoomText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 12, width: 36, textAlign: 'center' },
  toolbarDivider: { width: 1, height: 20, backgroundColor: '#4B5563', marginHorizontal: 4 },
  
  colHeaderBtn: { width: 34, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2, paddingVertical: 4, borderRadius: 4 },
  colHeaderBtnActive: { backgroundColor: 'rgba(255, 204, 0, 0.1)' },
  colHeaderText: { color: '#8A7851', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  
  builderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowHeaderBtn: { width: 40, height: 34, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3A3A4A', borderRadius: 6, marginRight: 8 },
  rowHeaderText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  rowCells: { flexDirection: 'row' },
  
  builderCell: { width: 34, height: 34, marginHorizontal: 2, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  cellStandard: { backgroundColor: '#BDBDBD' },
  cellVIP: { backgroundColor: '#FFCC00' },
  cellCouple: { backgroundColor: '#9B59B6' },
  cellAisle: { backgroundColor: '#1E1E2E' }, // Darker to signify path
  cellHidden: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4B5563', borderStyle: 'dashed' },
});

export default SeatLayoutManageScreen;
