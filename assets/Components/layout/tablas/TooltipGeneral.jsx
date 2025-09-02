export const TooltipGeneral = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme, colores, tamano, ctext }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: `${colores}`,
      color: ctext ?  ctext  :  '#000',
      boxShadow: theme.shadows[1],
      fontSize: 11,
      marginTop:`${tamano}`,
    },
  }));