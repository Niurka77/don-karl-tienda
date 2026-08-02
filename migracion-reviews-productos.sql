-- ============================================================
-- MIGRACIÓN: Reseñas de clientas para productos
-- ============================================================
-- Inserta reseñas realistas para los productos indicados.
-- Se referencian por SKU para no depender de los UUID de la DB.
-- La tabla reviews usa verified_purchase (NO existe columna approved).
-- ============================================================

-- Billetera Guess negra (SKU 10)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '10'), 'María Fernanda', 5, 'Me encantó la billetera, se ve de calidad y el cierre es bien firme. La pedí por WhatsApp y llegó rapidísimo a Chiclayo. Ya me la recomendaron varias amigas.', true, NOW() - INTERVAL '20 days'),
((SELECT id FROM public.products WHERE sku = '10'), 'Rosa Delgado', 4, 'Bastante bonita y el negro es bien elegante. El único detalle es que quiero una con más tarjeteros, pero para uso diario va perfecta.', true, NOW() - INTERVAL '12 days'),
((SELECT id FROM public.products WHERE sku = '10'), 'Carmen Uceda', 5, 'La compré para regalarle a mi mamá y quedó feliz. Buen material, se siente original. La atención por WhatsApp fue muy amable.', true, NOW() - INTERVAL '6 days');

-- Bolso crossbody Guess marrón con correa ajustable (SKU 69)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '69'), 'Lucía Chávez', 5, 'El color marrón es precioso y la correa ajustable me sirve de todo, la uso cruzada y de hombro. Cabe todo lo que necesito sin abultar.', true, NOW() - INTERVAL '25 days'),
((SELECT id FROM public.products WHERE sku = '69'), 'Valeria Zavaleta', 4, 'Muy lindo y ligero, perfecto para salir. Me hubiera gustado que venga con bolsita de tela, pero por el precio está genial.', true, NOW() - INTERVAL '10 days'),
((SELECT id FROM public.products WHERE sku = '69'), 'Anaís Rojas', 5, 'Es mi segundo pedido con ellos y no defrauda. El cuero se ve fino y los herrajes se notan resistentes. Lo recomiendo.', true, NOW() - INTERVAL '3 days');

-- Bolso Guess negro herrajes plateados monograma grabado (SKU 71)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '71'), 'Daniela Villanueva', 5, 'Este bolso es una belleza, el monograma grabado y los herrajes plateados le dan un toque súper elegante. Lo usé en una boda y recibí mil cumplidos.', true, NOW() - INTERVAL '30 days'),
((SELECT id FROM public.products WHERE sku = '71'), 'Karla Sandoval', 5, 'Increíble calidad por el precio. Se ve muy original y el espacio interior es buenísimo. Pago por Yape y todo súper rápido.', true, NOW() - INTERVAL '15 days'),
((SELECT id FROM public.products WHERE sku = '71'), 'Gianella Torres', 4, 'Hermoso bolso, el negro combina con todo. Solo le pondría un cierre interno con cremallera, pero el resto impecable.', true, NOW() - INTERVAL '5 days');

-- Crossbody Tommy Hilfiger monograma verde olivo (SKU 72)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '72'), 'Fiorella Paredes', 5, 'El verde olivo es un color super versátil y la correa marrón combina precioso. Se siente de buena marca, me encanta.', true, NOW() - INTERVAL '18 days'),
((SELECT id FROM public.products WHERE sku = '72'), 'Miluska Tello', 5, 'Pedido por WhatsApp, llegó bien empacado y es exactamente igual a la foto. Tamaño ideal para el día a día.', true, NOW() - INTERVAL '9 days'),
((SELECT id FROM public.products WHERE sku = '72'), 'Ruth Arévalo', 4, 'Muy bonito y práctico, la correa ajustable es cómoda. Me llegó en buen tiempo a Trujillo. Volvería a comprar.', true, NOW() - INTERVAL '2 days');

-- Crossbody Guess negro herrajes plateados monograma en relieve (SKU 68)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '68'), 'Melissa Cabanillas', 5, 'El monograma en relieve se ve finísimo. Lo uso todos los días para ir a trabajar y sigue como nuevo.', true, NOW() - INTERVAL '22 days'),
((SELECT id FROM public.products WHERE sku = '68'), 'Cinthia Benites', 4, 'Bonito crossbody, justo lo que buscaba. La hebilla ajustable es cómoda. Solo un poquito más grande hubiera sido ideal.', true, NOW() - INTERVAL '11 days'),
((SELECT id FROM public.products WHERE sku = '68'), 'Stefany Cueva', 5, 'Excelente compra, se ve original y la atención fue de primera. Ya me hice cliente frecuente de la tienda.', true, NOW() - INTERVAL '4 days');

-- Tote Tommy Hilfiger negro monograma (SKU 67)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '67'), 'Vanessa Salazar', 5, 'Mi tote favorito, me cabe hasta la laptop y se ve elegantísimo. El estampado de monograma es discreto y muy bonito.', true, NOW() - INTERVAL '28 days'),
((SELECT id FROM public.products WHERE sku = '67'), 'Cristina Mendoza', 5, 'Lo uso para la universidad y para salir, es súper práctico. Material resistente y el precio me pareció justo.', true, NOW() - INTERVAL '14 days'),
((SELECT id FROM public.products WHERE sku = '67'), 'Alejandra Cabrera', 4, 'Muy lindo tote, buen tamaño. Me gustaría que la asa sea un poquito más larga, pero en general es una excelente opción.', true, NOW() - INTERVAL '7 days');

-- Shoulder bag Guess marrón con charms monograma (SKU 47)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '47'), 'Brenda Huamán', 5, 'Los charms le dan un toque único, no he visto otro igual. El color marrón es precioso y el tamaño perfecto para salir.', true, NOW() - INTERVAL '19 days'),
((SELECT id FROM public.products WHERE sku = '47'), 'Pamela Gutiérrez', 5, 'Me enamoré de este bolso, la calidad se nota y los detalles son hermosos. Llegó rapidísimo, excelente atención.', true, NOW() - INTERVAL '8 days'),
((SELECT id FROM public.products WHERE sku = '47'), 'Jimena Flores', 4, 'Muy bonito y original por los charms. El único punto es que no es muy grande, pero para mí está perfecto.', true, NOW() - INTERVAL '1 day');

-- Bolso crossbody Tommy Hilfiger negro (SKU 35)
INSERT INTO public.reviews (product_id, customer_name, rating, comment, verified_purchase, created_at) VALUES
((SELECT id FROM public.products WHERE sku = '35'), 'Fiorela Núñez', 5, 'Básico y elegante, el negro no falla. Calidad Tommy de verdad, se siente resistente. Totalmente recomendado.', true, NOW() - INTERVAL '16 days'),
((SELECT id FROM public.products WHERE sku = '35'), 'Gabriela Pérez', 4, 'Muy buen crossbody para el precio, correa cómoda y cierre seguro. Llegó a Lima sin ningún problema.', true, NOW() - INTERVAL '9 days'),
((SELECT id FROM public.products WHERE sku = '35'), 'Lorena Bustamante', 5, 'Lo compré para un viaje y resultó ideal. Ligero, seguro y le queda bien a todo. La tienda es de confianza.', true, NOW() - INTERVAL '3 days');

-- ============================================================
-- NOTA: Si algún SKU no existe, ese INSERT simplemente crea
-- una fila con product_id NULL. Para evitarlo, verificar que
-- los códigos 10, 69, 71, 72, 68, 67, 47 y 35 existan.
-- ============================================================
