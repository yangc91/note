> 项目上经常会遇到导出Excel报表需求，简单总结下几个注意点

## Excel自适应

```
/**
	 * 设置内容自适应
	 * @param sheet sheet
	 * @param columns columns
	 */
private static void autoColumnSize(XSSFSheet sheet, int... columns)
        throws UnsupportedEncodingException {
    for (int columnNum = 0; columnNum <= columns.length; columnNum++)
    {
        int columnWidth = sheet.getColumnWidth(columnNum) / 256;
        for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++)
        {
            Row currentRow;
            //当前行未被使用过
            if (sheet.getRow(rowNum) == null)
            {
                currentRow = sheet.createRow(rowNum);
            }
            else
            {
                currentRow = sheet.getRow(rowNum);
            }

            if(currentRow.getCell(columnNum) != null)
            {
                Cell currentCell = currentRow.getCell(columnNum);
                int length = currentCell.toString().getBytes("GBK").length;
                if (columnWidth < length + 1)
                {
                    columnWidth = length + 1;
                }
            }
        }
        int maxwidth = Math.min(columnWidth * 256  , 255 * 256);
        sheet.setColumnWidth(columnNum, maxwidth);
    }
}
```
  * 需计算每一列展示内容最多的单元格所需的字节长度：columnWidth
  * 字节数 * 256 即为单元格宽度
  * 单元格最大宽度为 255 * 256
  * columnWidth * 256  , 255 * 256 取小即为该列宽度
  
## 流下载

```
public static void exportData(HttpServletResponse response, String fileName) throws IOException {
		// 重置response
		response.reset();
		BufferedOutputStream fout = new BufferedOutputStream(response.getOutputStream());
		
		// 设置下载头
		response.setContentType("application/vnd.ms-excel");
		response.addHeader("Content-Disposition","attachment;filename=\""+ new String(fileName.getBytes("utf-8"),"ISO8859-1") + ".xls\"");
		
		XSSFWorkbook workbook = new XSSFWorkbook(); 
			String title = deptName + "提案回复完成情况（" + DateFormatUtils.format(new Date(), FORMAT_PATTERN) + "）";
			XSSFSheet sheet = workbook.createSheet();
			...
			// fill excel data
			...
			workbook.write(fout);
			fout.flush();
			fout.close();
	}
```
  * `filename=\"` 一定注意 `\"`不要删除，apk下载可能会导致解析标题乱码，直接引起应用崩溃，而web后台访问完全正常
  * 终端访问下载接口时，添加时间戳，防止终端缓存链接导致下载失败