# Copyright (c) 2025
# Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
#
# Authors
# Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
# Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
#
# All rights reserved.
# This source code is licensed under the license found in the
# LICENSE file in the root directory of this source tree.

import cv2
import math
import numpy as np


def contours_coords(binary_image):
    contours, _ = cv2.findContours(
        binary_image.astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE
    )

    # Reshape each contour to (N, 2) and convert to list
    contours_list = [c.reshape(-1, 2).tolist() for c in contours]

    return contours_list


def morphometrics_parameters(bimask):
    ext_contour = get_external_contour_coords(bimask)
    if ext_contour is None:
        return None
    shape_area = cv2.contourArea(ext_contour)
    shape_perimeter = cv2.arcLength(ext_contour, True)

    convex_hull = cv2.convexHull(ext_contour)
    conv_hull_area = cv2.contourArea(convex_hull)
    conv_hull_perimeter = cv2.arcLength(convex_hull, True)

    d_max_feret, d_min_feret, __, _ = get_max_min_feret(convex_hull)

    if conv_hull_area == 0 or shape_perimeter == 0 or d_max_feret == 0:
        return None

    solidity = shape_area / conv_hull_area
    convexity = conv_hull_perimeter / shape_perimeter
    aspect_ratio = d_min_feret / d_max_feret

    return {
        "aspect_ratio": aspect_ratio,
        "convexity": convexity,
        "solidity": solidity,
        "shape_perimeter": shape_perimeter,
        "shape_area": shape_area,
        "conv_hull_perimeter": conv_hull_perimeter,
        "conv_hull_area": conv_hull_area,
        "d_max_feret": d_max_feret,
        "d_min_feret": d_min_feret,
    }


def get_external_contour_coords(bimask):
    external_contours, _ = cv2.findContours(
        bimask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE
    )
    # if several shapes, take the biggest one as it may be due to residual pixels
    if len(external_contours) > 1:
        max_contour = []
        for ctn in external_contours:
            if len(ctn) > len(max_contour):
                max_contour = ctn
        return max_contour
    elif len(external_contours) == 1:
        return external_contours[0]
    else:
        return None


def get_max_min_feret(convex_hull):
    """
    Compute the max and min Feret diameters

    Values def:
    maximum Feret diameter: largest distance between any two points of the convex hull

    Calculate minimum Feret diameter:
    For each edge of the convex hull (assumes counterclockwise order, no duplicates):
       1. Compute the perpendicular direction to the edge.
       2. Find the vertex farthest along this perpendicular (largest projection distance).
       3. This distance represents the width of the polygon along that edge's direction.
     Keep the smallest such width over all edges — this is the minimum Feret diameter.

    code inspired from ImageJ: https://github.com/imagej/ImageJ/blob/master/ij/gui/Roi.java#L383

    return
    max_feret : maximum feret diameter
    min_feret : minimum feret diameter
    max_feret_points : [point1, point2] point1 and point2 are vertices of the convex hull
    max_feret_point : [point1, point2] : point1 is a vertex of the convex hull;  point2 is the orthogonal projection of point1 onto the edge opposite to it. Point2 is not necessarily a vertex of the convex hull

    """
    # Maximum Feret diameter:
    max_feret = 0
    max_feret_points = None
    for p0 in convex_hull:
        for p1 in convex_hull:
            dist = math.sqrt((p1[0][0] - p0[0][0]) ** 2 + (p1[0][1] - p0[0][1]) ** 2)

            if dist > max_feret:
                max_feret = dist
                max_feret_points = [p0[0, :2], p1[0, :2]]

    # Minimum Feret diameter
    min_feret = math.inf
    min_feret_points = None
    for i, endpoint in enumerate(convex_hull):
        prev_endpoint = convex_hull[i - 1]

        # Cartesian parameters of line (prev_endpoint, endpoint) such as : ax+by+c=0
        a = prev_endpoint[0][1] - endpoint[0][1]
        b = endpoint[0][0] - prev_endpoint[0][0]
        c = prev_endpoint[0][0] * endpoint[0][1] - prev_endpoint[0][1] * endpoint[0][0]

        max_p_dist = 0
        max_p_dist_points = None
        for p in convex_hull:
            # Distance between p and line(prev_endpoint, endpoint)
            dist = abs(a * p[0][0] + b * p[0][1] + c) / math.sqrt((a**2 + b**2))

            if dist > max_p_dist:
                max_p_dist = dist

                # Find the intersection point with the line and the perpendicular passing through p
                # the perpendicular line has an equation of the form : y = x * b/a + d; with d a constant
                # the intersection point belongs to both lines : a*intersect_x + b*intersect_y + c = 0 and intersect_y = intersect_x*b/a + d
                if a != 0:
                    d = p[0][1] - p[0][0] * b / a  # d=p_y - p_x*b/a
                    intersect_x = int(a * (-b * d - c) / (a**2 + b**2))
                    intersect_y = int(d + b * (-b * d - c) / (a**2 + b**2))
                else:
                    # a == 0 means the edge is horizontal, so its perpendicular is of the form x=d, with d a constant
                    d = p[0][0]  # d = p_x
                    intersect_x = int(d)
                    intersect_y = int((-a * d - c) / b)

                intersect_point = [intersect_x, intersect_y]
                max_p_dist_points = [p[0, :2], intersect_point]

        if max_p_dist < min_feret:
            min_feret = max_p_dist
            min_feret_points = max_p_dist_points

    return max_feret, min_feret, max_feret_points, min_feret_points
