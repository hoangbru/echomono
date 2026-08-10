export function TrackRowSkeleton() {
  return (
    <tr className="border-b border-border/50 animate-pulse bg-card">
      <td className="py-3 px-4 w-12">
        <div className="w-4 h-4 bg-muted rounded mx-auto"></div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded shadow-sm shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-16 bg-muted rounded"></div>{" "}
        {/* Nghệ sĩ kết hợp */}
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-16 bg-muted rounded"></div> {/* Thể loại */}
      </td>
      <td className="py-3 px-4">
        <div className="h-6 w-20 bg-muted rounded-md"></div>{" "}
        {/* Badge Trạng thái */}
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-muted rounded-full"></div> {/* Nút 1 */}
          <div className="h-8 w-8 bg-muted rounded-full"></div> {/* Nút 2 */}
        </div>
      </td>
    </tr>
  );
}
