class RangoFechaMixin:
    fecha_campo = 'fecha'

    def get_queryset(self):
        queryset = super().get_queryset()
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)

        if fecha_desde:
            queryset = queryset.filter(**{f'{self.fecha_campo}__gte': fecha_desde})
        if fecha_hasta:
            queryset = queryset.filter(**{f'{self.fecha_campo}__lte': fecha_hasta})
        return queryset